import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import AuctionTier from "../../../../models/auctionTier";
import Player from "../../../../models/player";
import Team from "../../../../models/team";
import { getSession } from "../../../../lib/adminAuth";
import { calculateFifthPlayerBasePrice } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const POST = async (request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  try {
    const { action, tierId, selectedPlayerIds, customBasePrice, scope, timerSeconds, targetCategory } = await request.json();
    await connectToDatabase();

    let state = await AuctionState.findOne({ auctionCode: "LIVE" });
    if (!state) {
      state = await AuctionState.create({ auctionCode: "LIVE" });
    }

    // ========================================================
    // 1. START TIER AUCTION (5 PLAYERS)
    // ========================================================
    if (action === "START_TIER") {
      if (!tierId) {
        return Response.json({ error: "Tier ID is required to start." }, { status: 400 });
      }

      const tier = await AuctionTier.findById(tierId);
      if (!tier) {
        return Response.json({ error: "Tier not found." }, { status: 404 });
      }

      // Fetch the 5 players for this tier
      let tierPlayers = [];
      if (Array.isArray(selectedPlayerIds) && selectedPlayerIds.length > 0) {
        tierPlayers = await Player.find({ _id: { $in: selectedPlayerIds } }).limit(5);
      } else {
        // Pick players strictly assigned to this tier
        tierPlayers = await Player.find({
          $or: [
            { auctionTier: tier._id },
            { auctionTier: null, tier: tier.name, categories: tier.category },
          ],
        })
          .sort({ auctionOrder: 1, createdAt: 1 })
          .limit(5);

        // If fewer than 5 players assigned specifically to this tier, grab unassigned players in category
        if (tierPlayers.length < 5) {
          const needed = 5 - tierPlayers.length;
          const existingIds = tierPlayers.map((p) => p._id);
          const morePlayers = await Player.find({
            _id: { $nin: existingIds },
            auctionTier: null,
            tier: null,
            categories: tier.category,
          }).limit(needed);
          tierPlayers = [...tierPlayers, ...morePlayers];
        }
      }

      if (tierPlayers.length === 0) {
        return Response.json(
          { error: `No players available to auction for ${tier.category} - ${tier.name}. Please register or assign players first.` },
          { status: 400 }
        );
      }

      // Build 5-player queue (up to 5)
      const queue = tierPlayers.map((p, idx) => ({
        player: p._id,
        orderIndex: idx,
        fullName: p.fullName,
        photoUrl: p.photoUrl,
        playerId: p.playerId,
        registrationNumber: p.registrationNumber,
        session: p.session,
        category: tier.category,
        role: p.playingRole || (Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : (tier.category || "Player")),
        categories: Array.isArray(p.categories) ? p.categories : [tier.category],
        tier: tier.name,
        basePrice: p.basePrice || tier.basePrice || 500,
        soldPrice: null,
        soldToTeam: null,
        soldToTeamName: null,
        status: idx === 0 ? "in_auction" : "upcoming",
      }));

      state.status = "in_progress";
      state.category = tier.category;
      state.tierId = tier._id;
      state.tierName = tier.name;
      state.tierBasePrice = tier.basePrice || 500;
      state.players = queue;
      state.currentPlayerIndex = 0;
      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];
      state.hammerStatus = "waiting";
      state.timerSeconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : 20;
      state.timerEndAt = null;
      state.player3SoldPrice = null;
      state.player4SoldPrice = null;
      state.fifthPlayerCalculatedBasePrice = null;

      await state.save();
      return Response.json({ success: true, message: `Started ${tier.category} - ${tier.name} auction with ${queue.length} player(s).`, state });
    }

    // ========================================================
    // 2. HAMMER CONTROLS (GOING ONCE / GOING TWICE)
    // ========================================================
    if (action === "HAMMER_GOING_ONCE") {
      state.hammerStatus = "going_once";
      state.timerSeconds = 10;
      state.timerEndAt = new Date(Date.now() + 10000);
      await state.save();
      return Response.json({ success: true, state });
    }

    if (action === "HAMMER_GOING_TWICE") {
      state.hammerStatus = "going_twice";
      state.timerSeconds = 10;
      state.timerEndAt = new Date(Date.now() + 10000);
      await state.save();
      return Response.json({ success: true, state });
    }

    // ========================================================
    // 3. HAMMER SOLD
    // ========================================================
    if (action === "HAMMER_SOLD") {
      if (!state.currentBidderTeam || state.currentBid <= 0) {
        return Response.json(
          { error: "Cannot sell: No bids have been placed yet. Mark as unsold instead." },
          { status: 400 }
        );
      }

      const currIdx = state.currentPlayerIndex;
      const soldPrice = state.currentBid;
      const winningTeamId = state.currentBidderTeam;
      const winningTeamName = state.currentBidderTeamName;
      const currentPlayerInQueue = state.players[currIdx];

      if (currentPlayerInQueue) {
        currentPlayerInQueue.status = "sold";
        currentPlayerInQueue.soldPrice = soldPrice;
        currentPlayerInQueue.soldToTeam = winningTeamId;
        currentPlayerInQueue.soldToTeamName = winningTeamName;

        // Update in MongoDB Player collection
        await Player.findByIdAndUpdate(currentPlayerInQueue.player, {
          team: winningTeamId,
          soldPrice: soldPrice,
          auctionStatus: "sold",
        });

        // Update in MongoDB Team collection
        await Team.findByIdAndUpdate(winningTeamId, {
          $addToSet: { players: currentPlayerInQueue.player },
          $inc: { pointsSpent: soldPrice },
        });

        // Record 3rd and 4th player sold prices for 5th player calculation rule
        if (currIdx === 2) {
          state.player3SoldPrice = soldPrice;
        } else if (currIdx === 3) {
          state.player4SoldPrice = soldPrice;
          const avg = calculateFifthPlayerBasePrice(
            state.player3SoldPrice,
            soldPrice,
            state.tierBasePrice
          );
          state.fifthPlayerCalculatedBasePrice = avg;
          if (state.players[4]) {
            state.players[4].basePrice = avg;
          }

          // 5th player automatic assignment rule:
          // If 4 teams bought the first 4 players in this tier, the 5th player automatically goes to the remaining 5th team at the average price!
          const soldTeamsInTier = state.players
            .slice(0, 4)
            .filter((p) => p.status === "sold" && p.soldToTeam)
            .map((p) => p.soldToTeam.toString());

          const uniqueSoldTeams = new Set(soldTeamsInTier);

          if (uniqueSoldTeams.size === 4 && state.players[4]) {
            const allActiveTeams = await Team.find({ status: "active" });
            const remainingTeam = allActiveTeams.find(
              (t) => !uniqueSoldTeams.has(t._id.toString())
            );

            if (remainingTeam) {
              const player5 = state.players[4];
              player5.status = "sold";
              player5.soldPrice = avg;
              player5.soldToTeam = remainingTeam._id;
              player5.soldToTeamName = remainingTeam.name;

              // Update Player 5 in MongoDB
              await Player.findByIdAndUpdate(player5.player, {
                team: remainingTeam._id,
                soldPrice: avg,
                auctionStatus: "sold",
              });

              // Update Remaining Team in MongoDB
              await Team.findByIdAndUpdate(remainingTeam._id, {
                $addToSet: { players: player5.player },
                $inc: { pointsSpent: avg },
              });

              state.hammerStatus = "sold";
              state.status = "completed";
              state.currentPlayerIndex = 4;
              state.currentBid = avg;
              state.currentBidderTeam = remainingTeam._id;
              state.currentBidderTeamName = remainingTeam.name;
              state.currentBidderTeamLogo = remainingTeam.logoUrl || null;
              state.timerEndAt = null;

              await state.save();

              return Response.json({
                success: true,
                message: `SOLD to ${winningTeamName} for ৳ ${soldPrice.toLocaleString()}! And 5th Player (${player5.fullName}) automatically assigned to remaining team "${remainingTeam.name}" for ৳ ${avg.toLocaleString()} (Average Rule)! Tier auction complete.`,
                state,
                autoAssigned5thPlayer: {
                  playerName: player5.fullName,
                  teamName: remainingTeam.name,
                  price: avg,
                },
              });
            }
          }
        }
      }

      state.hammerStatus = "sold";
      state.timerEndAt = null;
      await state.save();

      return Response.json({
        success: true,
        message: `SOLD to ${winningTeamName} for ৳ ${soldPrice.toLocaleString()}!`,
        state,
      });
    }

    // ========================================================
    // 4. HAMMER UNSOLD
    // ========================================================
    if (action === "HAMMER_UNSOLD") {
      const currIdx = state.currentPlayerIndex;
      const currentPlayerInQueue = state.players[currIdx];

      if (currentPlayerInQueue) {
        currentPlayerInQueue.status = "unsold";
        currentPlayerInQueue.soldPrice = 0;

        await Player.findByIdAndUpdate(currentPlayerInQueue.player, {
          auctionStatus: "unsold",
        });

        if (currIdx === 2) {
          state.player3SoldPrice = 0;
        } else if (currIdx === 3) {
          state.player4SoldPrice = 0;
          if (state.player3SoldPrice) {
            const avg = calculateFifthPlayerBasePrice(state.player3SoldPrice, 0, state.tierBasePrice);
            state.fifthPlayerCalculatedBasePrice = avg;
            if (state.players[4]) {
              state.players[4].basePrice = avg;
            }
          }
        }
      }

      state.hammerStatus = "unsold";
      state.timerEndAt = null;
      await state.save();

      return Response.json({
        success: true,
        message: `Player passed and marked as Unsold.`,
        state,
      });
    }

    // ========================================================
    // 5. NEXT PLAYER
    // ========================================================
    if (action === "NEXT_PLAYER") {
      const nextIdx = state.currentPlayerIndex + 1;

      if (nextIdx >= state.players.length) {
        state.status = "completed";
        state.hammerStatus = "waiting";
        await state.save();
        return Response.json({
          success: true,
          message: `All players in this tier auction have been completed!`,
          state,
        });
      }

      state.currentPlayerIndex = nextIdx;
      state.players[nextIdx].status = "in_auction";

      // 5th player special rule calculation & auto-assignment:
      if (nextIdx === 4) {
        const avg = calculateFifthPlayerBasePrice(
          state.player3SoldPrice,
          state.player4SoldPrice,
          state.tierBasePrice
        );
        state.fifthPlayerCalculatedBasePrice = avg;
        state.players[4].basePrice = avg;

        const soldTeamsInTier = state.players
          .slice(0, 4)
          .filter((p) => p.status === "sold" && p.soldToTeam)
          .map((p) => p.soldToTeam.toString());

        const uniqueSoldTeams = new Set(soldTeamsInTier);

        if (uniqueSoldTeams.size === 4 && state.players[4].status !== "sold") {
          const allActiveTeams = await Team.find({ status: "active" });
          const remainingTeam = allActiveTeams.find(
            (t) => !uniqueSoldTeams.has(t._id.toString())
          );

          if (remainingTeam) {
            const player5 = state.players[4];
            player5.status = "sold";
            player5.soldPrice = avg;
            player5.soldToTeam = remainingTeam._id;
            player5.soldToTeamName = remainingTeam.name;

            await Player.findByIdAndUpdate(player5.player, {
              team: remainingTeam._id,
              soldPrice: avg,
              auctionStatus: "sold",
            });

            await Team.findByIdAndUpdate(remainingTeam._id, {
              $addToSet: { players: player5.player },
              $inc: { pointsSpent: avg },
            });

            state.currentPlayerIndex = 4;
            state.currentBid = avg;
            state.currentBidderTeam = remainingTeam._id;
            state.currentBidderTeamName = remainingTeam.name;
            state.currentBidderTeamLogo = remainingTeam.logoUrl || null;
            state.hammerStatus = "sold";
            state.status = "completed";
            state.timerEndAt = null;

            await state.save();

            return Response.json({
              success: true,
              message: `5th Player (${player5.fullName}) automatically assigned to remaining team "${remainingTeam.name}" for ৳ ${avg.toLocaleString()} (Average Rule)! Tier complete.`,
              state,
              autoAssigned5thPlayer: {
                playerName: player5.fullName,
                teamName: remainingTeam.name,
                price: avg,
              },
            });
          }
        }
      }

      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];
      state.hammerStatus = "waiting";
      state.timerSeconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : 20;
      state.timerEndAt = null;

      await state.save();
      return Response.json({
        success: true,
        message: `Now auctioning Player ${nextIdx + 1} of ${state.players.length}: ${state.players[nextIdx].fullName}`,
        state,
      });
    }

    // ========================================================
    // 5B. OPEN BIDDING / REVEAL PLAYER
    // ========================================================
    if (action === "OPEN_BIDDING") {
      if (state.status !== "in_progress") {
        state.status = "in_progress";
      }
      state.hammerStatus = "bidding_open";
      const seconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : (state.timerSeconds || 20);
      state.timerSeconds = seconds;
      state.timerEndAt = new Date(Date.now() + seconds * 1000);
      await state.save();

      const currP = state.players[state.currentPlayerIndex];
      return Response.json({
        success: true,
        message: `Bidding opened for ${currP?.fullName || "current player"}!`,
        state,
      });
    }

    if (action === "REVEAL_PLAYER") {
      state.hammerStatus = "waiting";
      state.timerEndAt = null;
      await state.save();
      return Response.json({
        success: true,
        message: `Showing player stage reveal screen to public.`,
        state,
      });
    }

    // ========================================================
    // 6. PAUSE / RESUME / STOP / RESET
    // ========================================================
    if (action === "PAUSE") {
      state.status = "paused";
      state.timerEndAt = null;
      await state.save();
      return Response.json({ success: true, message: "Auction has been paused.", state });
    }

    if (action === "RESUME") {
      state.status = "in_progress";
      if (["bidding_open", "going_once", "going_twice"].includes(state.hammerStatus)) {
        state.timerEndAt = new Date(Date.now() + 15000);
      }
      await state.save();
      return Response.json({ success: true, message: "Auction has resumed.", state });
    }

    if (action === "STOP") {
      state.status = "completed";
      state.hammerStatus = "waiting";
      state.timerEndAt = null;
      await state.save();
      return Response.json({
        success: true,
        message: "Auction session stopped by auctioneer.",
        state,
      });
    }

    // ========================================================
    // AUTO-ASSIGN 5TH PLAYER TO REMAINING TEAM (AVERAGE RULE)
    // ========================================================
    if (action === "AUTO_ASSIGN_5TH_PLAYER") {
      const avg = calculateFifthPlayerBasePrice(
        state.player3SoldPrice,
        state.player4SoldPrice,
        state.tierBasePrice || 500
      );

      const soldTeamsInTier = (state.players || [])
        .slice(0, 4)
        .filter((p) => p.status === "sold" && p.soldToTeam)
        .map((p) => p.soldToTeam.toString());

      const uniqueSoldTeams = new Set(soldTeamsInTier);
      const allActiveTeams = await Team.find({ status: "active" });
      const remainingTeam = allActiveTeams.find(
        (t) => !uniqueSoldTeams.has(t._id.toString())
      );

      if (!remainingTeam) {
        return Response.json(
          { error: "Could not find a unique remaining team that hasn't acquired a player in this tier." },
          { status: 400 }
        );
      }

      const player5 = state.players?.[4];
      if (!player5) {
        return Response.json({ error: "5th player not found in current tier queue." }, { status: 400 });
      }

      player5.status = "sold";
      player5.soldPrice = avg;
      player5.soldToTeam = remainingTeam._id;
      player5.soldToTeamName = remainingTeam.name;

      await Player.findByIdAndUpdate(player5.player, {
        team: remainingTeam._id,
        soldPrice: avg,
        auctionStatus: "sold",
      });

      await Team.findByIdAndUpdate(remainingTeam._id, {
        $addToSet: { players: player5.player },
        $inc: { pointsSpent: avg },
      });

      state.fifthPlayerCalculatedBasePrice = avg;
      state.currentPlayerIndex = 4;
      state.currentBid = avg;
      state.currentBidderTeam = remainingTeam._id;
      state.currentBidderTeamName = remainingTeam.name;
      state.currentBidderTeamLogo = remainingTeam.logoUrl || null;
      state.hammerStatus = "sold";
      state.status = "completed";
      state.timerEndAt = null;

      await state.save();

      return Response.json({
        success: true,
        message: `5th Player (${player5.fullName}) auto-assigned to ${remainingTeam.name} for ৳ ${avg.toLocaleString()} (Average Rule)! Tier auction completed.`,
        state,
      });
    }

    if (action === "RESET") {
      // 1. Reset Current Player Only
      if (scope === "CURRENT_PLAYER") {
        const currIdx = state.currentPlayerIndex;
        const currentP = state.players[currIdx];
        if (currentP) {
          // If this player was already marked sold, refund the winning team points & roster
          if (currentP.status === "sold" && currentP.soldToTeam && currentP.soldPrice) {
            await Team.findByIdAndUpdate(currentP.soldToTeam, {
              $pull: { players: currentP.player },
            });
            const t = await Team.findById(currentP.soldToTeam).populate("players", "soldPrice");
            if (t) {
              t.pointsSpent = (t.players || []).reduce(
                (sum, ply) => sum + (Number(ply.soldPrice) || 0),
                0
              );
              await t.save();
            }
          }
          currentP.status = "in_auction";
          currentP.soldPrice = null;
          currentP.soldToTeam = null;
          currentP.soldToTeamName = null;

          await Player.findByIdAndUpdate(currentP.player, {
            team: null,
            soldPrice: null,
            auctionStatus: "in_auction",
          });
        }

        state.currentBid = 0;
        state.currentBidderTeam = null;
        state.currentBidderTeamName = null;
        state.currentBidderTeamLogo = null;
        state.bidHistory = [];
        state.hammerStatus = "bidding_open";
        state.timerSeconds = 20;
        state.timerEndAt = new Date(Date.now() + 20000);
        state.status = "in_progress";

        await state.save();
        return Response.json({
          success: true,
          message: `Current player's bids have been reset and team balance refunded.`,
          state,
        });
      }

      // 2. Reset a Specific Category (Only refund money spent in that category)
      if (scope === "CATEGORY") {
        const catName = targetCategory || state.category;
        if (!catName) {
          return Response.json(
            { error: "Target category name is required to perform category reset." },
            { status: 400 }
          );
        }

        const catQuery = catName === "ICON PLAYER"
          ? { $or: [{ categories: "ICON PLAYER" }, { tier: "ICON PLAYER" }, { isIcon: true }] }
          : { $or: [{ categories: catName }, { category: catName }] };

        const categoryPlayers = await Player.find(catQuery);
        const categoryPlayerIds = categoryPlayers.map((p) => p._id);

        const soldCategoryPlayers = categoryPlayers.filter(
          (p) => p.auctionStatus === "sold" || p.team || p.soldPrice
        );

        const affectedTeamIds = new Set();
        for (const p of soldCategoryPlayers) {
          if (p.team) affectedTeamIds.add(p.team.toString());
        }

        // Remove these players from all team rosters
        if (categoryPlayerIds.length > 0) {
          await Team.updateMany(
            {},
            { $pull: { players: { $in: categoryPlayerIds } } }
          );
        }

        // Recalculate pointsSpent for affected teams so only category money is refunded
        for (const teamId of affectedTeamIds) {
          const t = await Team.findById(teamId).populate("players", "soldPrice");
          if (t) {
            t.pointsSpent = (t.players || []).reduce(
              (sum, ply) => sum + (Number(ply.soldPrice) || 0),
              0
            );
            await t.save();
          }
        }

        // Reset the players in this category
        if (categoryPlayerIds.length > 0) {
          await Player.updateMany(
            { _id: { $in: categoryPlayerIds } },
            {
              $set: {
                team: null,
                soldPrice: null,
                auctionStatus: "upcoming",
              },
            }
          );
        }

        // If active auction session is on this category, reset state to idle
        if (state.category === catName) {
          state.status = "idle";
          state.category = null;
          state.tierId = null;
          state.tierName = null;
          state.tierBasePrice = 0;
          state.players = [];
          state.currentPlayerIndex = 0;
          state.currentBid = 0;
          state.currentBidderTeam = null;
          state.currentBidderTeamName = null;
          state.currentBidderTeamLogo = null;
          state.bidHistory = [];
          state.hammerStatus = "waiting";
          state.timerEndAt = null;
          state.player3SoldPrice = null;
          state.player4SoldPrice = null;
          state.fifthPlayerCalculatedBasePrice = null;
        }

        await state.save();

        return Response.json({
          success: true,
          message: `Category "${catName}" auction reset! ${soldCategoryPlayers.length} player(s) refunded and team balances restored.`,
          state,
          refundedCount: soldCategoryPlayers.length,
        });
      }

      // 3. Reset Full Tournament / All Auction Sales
      if (scope === "FULL" || scope === "FULL_TOURNAMENT") {
        await Player.updateMany(
          {},
          {
            $set: {
              team: null,
              soldPrice: null,
              auctionStatus: "upcoming",
            },
          }
        );

        await Team.updateMany(
          {},
          {
            $set: {
              players: [],
              pointsSpent: 0,
            },
          }
        );

        state.status = "idle";
        state.category = null;
        state.tierId = null;
        state.tierName = null;
        state.tierBasePrice = 0;
        state.players = [];
        state.currentPlayerIndex = 0;
        state.currentBid = 0;
        state.currentBidderTeam = null;
        state.currentBidderTeamName = null;
        state.currentBidderTeamLogo = null;
        state.bidHistory = [];
        state.hammerStatus = "waiting";
        state.timerEndAt = null;
        state.player3SoldPrice = null;
        state.player4SoldPrice = null;
        state.fifthPlayerCalculatedBasePrice = null;

        await state.save();

        return Response.json({
          success: true,
          message: "Entire auction reset successfully! All player sales cleared and all team balances restored to 10,000 PTS.",
          state,
        });
      }

      // 4. Reset Current Session
      const soldInSession = (state.players || []).filter(
        (p) => p.status === "sold" && p.soldToTeam
      );

      const affectedTeamIds = new Set();
      const pIdsToReset = [];

      for (const p of soldInSession) {
        if (p.soldToTeam) affectedTeamIds.add(p.soldToTeam.toString());
        if (p.player) pIdsToReset.push(p.player);
      }

      if (pIdsToReset.length > 0) {
        await Team.updateMany(
          {},
          { $pull: { players: { $in: pIdsToReset } } }
        );

        for (const teamId of affectedTeamIds) {
          const t = await Team.findById(teamId).populate("players", "soldPrice");
          if (t) {
            t.pointsSpent = (t.players || []).reduce(
              (sum, ply) => sum + (Number(ply.soldPrice) || 0),
              0
            );
            await t.save();
          }
        }

        await Player.updateMany(
          { _id: { $in: pIdsToReset } },
          {
            $set: {
              team: null,
              soldPrice: null,
              auctionStatus: "upcoming",
            },
          }
        );
      }

      state.status = "idle";
      state.category = null;
      state.tierId = null;
      state.tierName = null;
      state.tierBasePrice = 0;
      state.players = [];
      state.currentPlayerIndex = 0;
      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];
      state.hammerStatus = "waiting";
      state.timerEndAt = null;
      state.player3SoldPrice = null;
      state.player4SoldPrice = null;
      state.fifthPlayerCalculatedBasePrice = null;

      await state.save();

      return Response.json({
        success: true,
        message: `Current session reset to idle. ${soldInSession.length} player(s) refunded to team purses.`,
        state,
      });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("AUCTION_CONTROL_ERROR:", error);
    return Response.json(
      { error: error?.message || "Failed to process auction control action." },
      { status: 500 }
    );
  }
};
