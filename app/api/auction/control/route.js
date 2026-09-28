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
    const { action, tierId, selectedPlayerIds, customBasePrice, scope } = await request.json();
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
        // Pick players assigned to this tier or category
        tierPlayers = await Player.find({
          $or: [{ auctionTier: tier._id }, { tier: tier.name }],
        }).limit(5);

        // If fewer than 5 players assigned specifically to this tier, grab unassigned players in category
        if (tierPlayers.length < 5) {
          const needed = 5 - tierPlayers.length;
          const existingIds = tierPlayers.map((p) => p._id);
          const morePlayers = await Player.find({
            _id: { $nin: existingIds },
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
        tier: tier.name,
        basePrice: tier.basePrice || 500,
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
      state.hammerStatus = "bidding_open";
      state.timerSeconds = 20;
      state.timerEndAt = new Date(Date.now() + 20000);
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
          if (state.player3SoldPrice) {
            const avg = calculateFifthPlayerBasePrice(state.player3SoldPrice, soldPrice, state.tierBasePrice);
            state.fifthPlayerCalculatedBasePrice = avg;
            if (state.players[4]) {
              state.players[4].basePrice = avg;
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

      // 5th player special rule calculation:
      if (nextIdx === 4) {
        const avg = calculateFifthPlayerBasePrice(
          state.player3SoldPrice,
          state.player4SoldPrice,
          state.tierBasePrice
        );
        state.fifthPlayerCalculatedBasePrice = avg;
        state.players[4].basePrice = avg;
      }

      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];
      state.hammerStatus = "bidding_open";
      state.timerSeconds = 20;
      state.timerEndAt = new Date(Date.now() + 20000);

      await state.save();
      return Response.json({
        success: true,
        message: `Now auctioning Player ${nextIdx + 1} of ${state.players.length}: ${state.players[nextIdx].fullName}`,
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

    if (action === "RESET") {
      if (scope === "CURRENT_PLAYER") {
        const currIdx = state.currentPlayerIndex;
        const currentP = state.players[currIdx];
        if (currentP) {
          // If this player was already marked sold, refund the winning team points & roster
          if (currentP.status === "sold" && currentP.soldToTeam && currentP.soldPrice) {
            await Team.findByIdAndUpdate(currentP.soldToTeam, {
              $pull: { players: currentP.player },
              $inc: { pointsSpent: -currentP.soldPrice },
            });
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
          message: `Current player's bids have been reset. Bidding reopened!`,
          state,
        });
      }

      // Default: Full session reset to idle
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
      return Response.json({ success: true, message: "Auction session completely reset to idle.", state });
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
