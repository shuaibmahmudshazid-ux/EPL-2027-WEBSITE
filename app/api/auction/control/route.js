import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import AuctionTier from "../../../../models/auctionTier";
import Player from "../../../../models/player";
import Team from "../../../../models/team";
import { getSession } from "../../../../lib/adminAuth";
import { calculateFifthPlayerBasePrice, DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const POST = async (request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      action,
      playerId,
      playerIds,
      tierId,
      selectedPlayerIds,
      customBasePrice,
      scope,
      timerSeconds,
      teamId,
      amount,
      soldPrice,
      enabled,
    } = body;

    await connectToDatabase();

    let state = await AuctionState.findOne({ auctionCode: "LIVE" });
    if (!state) {
      state = await AuctionState.create({ auctionCode: "LIVE" });
    }

    // ========================================================
    // 1. SELECT ANY PLAYER TO AUCTION (SIMPLE 1-CLICK AUCTION)
    // ========================================================
    if (action === "SELECT_PLAYER") {
      if (!playerId) {
        return Response.json({ error: "Player ID is required to select." }, { status: 400 });
      }

      const player = await Player.findById(playerId);
      if (!player) {
        return Response.json({ error: "Player not found." }, { status: 404 });
      }

      const effectiveBasePrice =
        typeof customBasePrice === "number" && customBasePrice >= 0
          ? customBasePrice
          : player.basePrice > 0
          ? player.basePrice
          : 500;

      const singleQueueItem = {
        player: player._id,
        orderIndex: 0,
        fullName: player.fullName,
        photoUrl: player.photoUrl,
        playerId: player.playerId,
        registrationNumber: player.registrationNumber,
        session: player.session,
        category: player.categories?.[0] || player.tier || "General",
        role: player.categories?.[0] || "Player",
        categories: Array.isArray(player.categories) ? player.categories : [player.categories || "General"],
        tier: player.tier || "Open Tier",
        basePrice: effectiveBasePrice,
        soldPrice: null,
        soldToTeam: null,
        soldToTeamName: null,
        status: "in_auction",
      };

      state.status = "in_progress";
      state.category = singleQueueItem.category;
      state.tierId = player.auctionTier || null;
      state.tierName = player.tier || "Open Tier";
      state.tierBasePrice = effectiveBasePrice;
      state.players = [singleQueueItem];
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

      // Update player auctionStatus in DB
      await Player.findByIdAndUpdate(player._id, { auctionStatus: "in_auction" });

      return Response.json({
        success: true,
        message: `${player.fullName} (${player.playerId}) is now LIVE under the hammer!`,
        state,
      });
    }

    // ========================================================
    // 2. QUEUE MULTIPLE PLAYERS (CUSTOM BATCH)
    // ========================================================
    if (action === "QUEUE_PLAYERS") {
      const ids = Array.isArray(playerIds) && playerIds.length > 0 ? playerIds : [];
      if (ids.length === 0) {
        return Response.json({ error: "Select at least 1 player to queue." }, { status: 400 });
      }

      const players = await Player.find({ _id: { $in: ids } });
      if (players.length === 0) {
        return Response.json({ error: "No players found." }, { status: 404 });
      }

      const queue = players.map((p, idx) => ({
        player: p._id,
        orderIndex: idx,
        fullName: p.fullName,
        photoUrl: p.photoUrl,
        playerId: p.playerId,
        registrationNumber: p.registrationNumber,
        session: p.session,
        category: p.categories?.[0] || p.tier || "General",
        role: p.categories?.[0] || "Player",
        categories: Array.isArray(p.categories) ? p.categories : [p.categories || "General"],
        tier: p.tier || "Open Tier",
        basePrice: p.basePrice || 500,
        soldPrice: null,
        soldToTeam: null,
        soldToTeamName: null,
        status: idx === 0 ? "in_auction" : "upcoming",
      }));

      state.status = "in_progress";
      state.category = queue[0].category;
      state.tierId = null;
      state.tierName = "Custom Queue";
      state.tierBasePrice = queue[0].basePrice || 500;
      state.players = queue;
      state.currentPlayerIndex = 0;
      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];
      state.hammerStatus = "waiting";
      state.timerSeconds = 20;
      state.timerEndAt = null;

      await state.save();
      await Player.findByIdAndUpdate(queue[0].player, { auctionStatus: "in_auction" });

      return Response.json({
        success: true,
        message: `Queued ${queue.length} players. ${queue[0].fullName} is now live!`,
        state,
      });
    }

    // ========================================================
    // 3. ADMIN DIRECT SET BID / QUICK INCREMENT FOR TEAM
    // ========================================================
    if (action === "SET_BID" || action === "ADMIN_BID") {
      const bidAmount = Number(amount);
      if (isNaN(bidAmount) || bidAmount <= 0) {
        return Response.json({ error: "A valid positive bid amount is required." }, { status: 400 });
      }

      if (!teamId) {
        return Response.json({ error: "Please select a team for this bid." }, { status: 400 });
      }

      const team = await Team.findById(teamId).populate("players", "soldPrice");
      if (!team) {
        return Response.json({ error: "Selected team was not found." }, { status: 404 });
      }

      // Check team remaining points
      const pointsSpent = (team.players || []).reduce(
        (sum, p) => sum + (Number(p.soldPrice) || 0),
        0
      );
      const pointsRemaining = Math.max(0, DEFAULT_TEAM_POINTS - pointsSpent);

      if (bidAmount > pointsRemaining) {
        return Response.json(
          {
            error: `${team.name} has only ৳ ${pointsRemaining.toLocaleString()} remaining (Requested bid: ৳ ${bidAmount.toLocaleString()}).`,
          },
          { status: 400 }
        );
      }

      state.currentBid = bidAmount;
      state.currentBidderTeam = team._id;
      state.currentBidderTeamName = team.name;
      state.currentBidderTeamLogo = team.logoUrl;
      state.hammerStatus = "bidding_open";
      state.timerSeconds = 15;
      state.timerEndAt = new Date(Date.now() + 15000);

      state.bidHistory.unshift({
        team: team._id,
        teamName: team.name,
        teamLogo: team.logoUrl,
        amount: bidAmount,
        timestamp: new Date(),
      });

      await state.save();

      return Response.json({
        success: true,
        message: `Bid of ৳ ${bidAmount.toLocaleString()} recorded for ${team.name}!`,
        state,
      });
    }

    // ========================================================
    // 4. INSTANT SELL DIRECTLY TO TEAM (ADMIN DIRECT ASSIGN)
    // ========================================================
    if (action === "INSTANT_SELL") {
      const currIdx = state.currentPlayerIndex;
      const currentPlayerInQueue = state.players[currIdx];

      if (!currentPlayerInQueue) {
        return Response.json({ error: "No player currently on the podium to sell." }, { status: 400 });
      }

      if (!teamId) {
        return Response.json({ error: "Please select a team to sell the player to." }, { status: 400 });
      }

      const team = await Team.findById(teamId).populate("players", "soldPrice");
      if (!team) {
        return Response.json({ error: "Winning team not found." }, { status: 404 });
      }

      const finalPrice =
        typeof soldPrice === "number" && soldPrice > 0
          ? soldPrice
          : state.currentBid > 0
          ? state.currentBid
          : currentPlayerInQueue.basePrice || 500;

      // Update in MongoDB Player
      await Player.findByIdAndUpdate(currentPlayerInQueue.player, {
        team: team._id,
        soldPrice: finalPrice,
        auctionStatus: "sold",
      });

      // Update in MongoDB Team
      await Team.findByIdAndUpdate(team._id, {
        $addToSet: { players: currentPlayerInQueue.player },
        $inc: { pointsSpent: finalPrice },
      });

      // Update queue item
      currentPlayerInQueue.status = "sold";
      currentPlayerInQueue.soldPrice = finalPrice;
      currentPlayerInQueue.soldToTeam = team._id;
      currentPlayerInQueue.soldToTeamName = team.name;

      state.currentBid = finalPrice;
      state.currentBidderTeam = team._id;
      state.currentBidderTeamName = team.name;
      state.currentBidderTeamLogo = team.logoUrl;
      state.hammerStatus = "sold";
      state.timerEndAt = null;

      await state.save();

      return Response.json({
        success: true,
        message: `🏆 SOLD! ${currentPlayerInQueue.fullName} sold to ${team.name} for ৳ ${finalPrice.toLocaleString()}!`,
        state,
      });
    }

    // ========================================================
    // 5. UPDATE CURRENT PLAYER BASE PRICE ON THE FLY
    // ========================================================
    if (action === "UPDATE_BASE_PRICE") {
      const newBase = Number(customBasePrice);
      if (isNaN(newBase) || newBase < 0) {
        return Response.json({ error: "Invalid base price." }, { status: 400 });
      }

      const currIdx = state.currentPlayerIndex;
      if (state.players && state.players[currIdx]) {
        state.players[currIdx].basePrice = newBase;
        await Player.findByIdAndUpdate(state.players[currIdx].player, { basePrice: newBase });
      }
      state.tierBasePrice = newBase;
      await state.save();

      return Response.json({
        success: true,
        message: `Base price updated to ৳ ${newBase.toLocaleString()}.`,
        state,
      });
    }

    // ========================================================
    // 6. TOGGLE ONLINE BIDDING (ADMIN SWITCH)
    // ========================================================
    if (action === "TOGGLE_ONLINE_BIDDING") {
      const isEnabled = enabled !== undefined ? Boolean(enabled) : !state.onlineBiddingEnabled;
      state.onlineBiddingEnabled = isEnabled;
      await state.save();

      return Response.json({
        success: true,
        message: isEnabled
          ? "Online Team Bidding is now ENABLED. Teams can bid from their devices."
          : "Online Team Bidding is now DISABLED. Only Admin can place bids.",
        state,
      });
    }

    // ========================================================
    // 7. UNDO LAST ACTION (REFUND TEAM & RESTORE PLAYER)
    // ========================================================
    if (action === "UNDO_PLAYER" || action === "UNDO_LAST") {
      const currIdx = state.currentPlayerIndex;
      const targetPlayer = state.players[currIdx];

      if (!targetPlayer) {
        return Response.json({ error: "No player to undo." }, { status: 400 });
      }

      if (targetPlayer.status === "sold" && targetPlayer.soldToTeam) {
        // Refund team points & pull player from squad
        await Team.findByIdAndUpdate(targetPlayer.soldToTeam, {
          $pull: { players: targetPlayer.player },
          $inc: { pointsSpent: -(targetPlayer.soldPrice || 0) },
        });
      }

      // Restore MongoDB Player status
      await Player.findByIdAndUpdate(targetPlayer.player, {
        team: null,
        soldPrice: null,
        auctionStatus: "in_auction",
      });

      // Restore queue state
      targetPlayer.status = "in_auction";
      targetPlayer.soldPrice = null;
      targetPlayer.soldToTeam = null;
      targetPlayer.soldToTeamName = null;

      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.hammerStatus = "waiting";
      state.timerSeconds = 20;
      state.timerEndAt = null;
      state.status = "in_progress";

      await state.save();

      return Response.json({
        success: true,
        message: `Undone! ${targetPlayer.fullName} has been restored to the auction podium. Points refunded.`,
        state,
      });
    }

    // ========================================================
    // 8. START TIER AUCTION (5 PLAYERS) - PRESERVED FOR TIERS
    // ========================================================
    if (action === "START_TIER") {
      if (!tierId) {
        return Response.json({ error: "Tier ID is required to start." }, { status: 400 });
      }

      const tier = await AuctionTier.findById(tierId);
      if (!tier) {
        return Response.json({ error: "Tier not found." }, { status: 404 });
      }

      let tierPlayers = [];
      if (Array.isArray(selectedPlayerIds) && selectedPlayerIds.length > 0) {
        tierPlayers = await Player.find({ _id: { $in: selectedPlayerIds } }).limit(5);
      } else {
        tierPlayers = await Player.find({
          $or: [{ auctionTier: tier._id }, { tier: tier.name }],
        }).limit(5);

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
          { error: `No players available for ${tier.category} - ${tier.name}.` },
          { status: 400 }
        );
      }

      const queue = tierPlayers.map((p, idx) => ({
        player: p._id,
        orderIndex: idx,
        fullName: p.fullName,
        photoUrl: p.photoUrl,
        playerId: p.playerId,
        registrationNumber: p.registrationNumber,
        session: p.session,
        category: tier.category,
        role: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories[0] : (tier.category || "Player"),
        categories: Array.isArray(p.categories) ? p.categories : [tier.category],
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
      state.hammerStatus = "waiting";
      state.timerSeconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : 20;
      state.timerEndAt = null;
      state.player3SoldPrice = null;
      state.player4SoldPrice = null;
      state.fifthPlayerCalculatedBasePrice = null;

      await state.save();
      await Player.findByIdAndUpdate(queue[0].player, { auctionStatus: "in_auction" });

      return Response.json({ success: true, message: `Started ${tier.category} - ${tier.name} auction with ${queue.length} player(s).`, state });
    }

    // ========================================================
    // 9. HAMMER CONTROLS (GOING ONCE / GOING TWICE)
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
    // 10. HAMMER SOLD
    // ========================================================
    if (action === "HAMMER_SOLD") {
      const winningTeamId = teamId || state.currentBidderTeam;
      const winningPrice = typeof soldPrice === "number" && soldPrice > 0 ? soldPrice : state.currentBid;

      if (!winningTeamId || winningPrice <= 0) {
        return Response.json(
          { error: "Cannot sell: No bids have been placed yet. Select a team or mark as unsold." },
          { status: 400 }
        );
      }

      const winningTeam = await Team.findById(winningTeamId);
      if (!winningTeam) {
        return Response.json({ error: "Winning team not found." }, { status: 404 });
      }

      const currIdx = state.currentPlayerIndex;
      const currentPlayerInQueue = state.players[currIdx];

      if (currentPlayerInQueue) {
        currentPlayerInQueue.status = "sold";
        currentPlayerInQueue.soldPrice = winningPrice;
        currentPlayerInQueue.soldToTeam = winningTeam._id;
        currentPlayerInQueue.soldToTeamName = winningTeam.name;

        // Update MongoDB Player
        await Player.findByIdAndUpdate(currentPlayerInQueue.player, {
          team: winningTeam._id,
          soldPrice: winningPrice,
          auctionStatus: "sold",
        });

        // Update MongoDB Team
        await Team.findByIdAndUpdate(winningTeam._id, {
          $addToSet: { players: currentPlayerInQueue.player },
          $inc: { pointsSpent: winningPrice },
        });

        // Record 3rd and 4th player sold prices for 5th player calculation rule
        if (currIdx === 2) {
          state.player3SoldPrice = winningPrice;
        } else if (currIdx === 3) {
          state.player4SoldPrice = winningPrice;
          if (state.player3SoldPrice) {
            const avg = calculateFifthPlayerBasePrice(state.player3SoldPrice, winningPrice, state.tierBasePrice);
            state.fifthPlayerCalculatedBasePrice = avg;
            if (state.players[4]) {
              state.players[4].basePrice = avg;
            }
          }
        }
      }

      state.currentBid = winningPrice;
      state.currentBidderTeam = winningTeam._id;
      state.currentBidderTeamName = winningTeam.name;
      state.currentBidderTeamLogo = winningTeam.logoUrl;
      state.hammerStatus = "sold";
      state.timerEndAt = null;
      await state.save();

      return Response.json({
        success: true,
        message: `🏆 SOLD to ${winningTeam.name} for ৳ ${winningPrice.toLocaleString()}!`,
        state,
      });
    }

    // ========================================================
    // 11. HAMMER UNSOLD
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
    // 12. NEXT / PREVIOUS PLAYER
    // ========================================================
    if (action === "NEXT_PLAYER") {
      const nextIdx = state.currentPlayerIndex + 1;

      if (nextIdx >= state.players.length) {
        state.status = "completed";
        state.hammerStatus = "waiting";
        await state.save();
        return Response.json({
          success: true,
          message: `Queue completed! All players in this auction queue have been processed.`,
          state,
        });
      }

      state.currentPlayerIndex = nextIdx;
      state.players[nextIdx].status = "in_auction";

      if (nextIdx === 4 && state.player3SoldPrice !== null && state.player4SoldPrice !== null) {
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
      state.hammerStatus = "waiting";
      state.timerSeconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : 20;
      state.timerEndAt = null;

      await state.save();
      await Player.findByIdAndUpdate(state.players[nextIdx].player, { auctionStatus: "in_auction" });

      return Response.json({
        success: true,
        message: `Now auctioning Player ${nextIdx + 1} of ${state.players.length}: ${state.players[nextIdx].fullName}`,
        state,
      });
    }

    if (action === "PREV_PLAYER") {
      if (state.currentPlayerIndex <= 0) {
        return Response.json({ error: "Already at the first player." }, { status: 400 });
      }

      const prevIdx = state.currentPlayerIndex - 1;
      state.currentPlayerIndex = prevIdx;
      state.currentBid = state.players[prevIdx].soldPrice || 0;
      state.currentBidderTeam = state.players[prevIdx].soldToTeam || null;
      state.currentBidderTeamName = state.players[prevIdx].soldToTeamName || null;
      state.hammerStatus = state.players[prevIdx].status === "sold" ? "sold" : "waiting";

      await state.save();
      return Response.json({
        success: true,
        message: `Moved to Player ${prevIdx + 1}: ${state.players[prevIdx].fullName}`,
        state,
      });
    }

    // ========================================================
    // 13. START BID / OPEN BIDDING / REVEAL
    // ========================================================
    if (action === "START_BID" || action === "OPEN_BIDDING") {
      if (state.status !== "in_progress") {
        state.status = "in_progress";
      }
      state.hammerStatus = "bidding_open";
      const seconds = typeof timerSeconds === "number" && timerSeconds > 0 ? timerSeconds : 20;
      state.timerSeconds = seconds;
      state.timerEndAt = new Date(Date.now() + seconds * 1000);

      const currP = state.players[state.currentPlayerIndex];
      const baseAmt = currP?.basePrice > 0 ? currP.basePrice : (state.tierBasePrice || 500);

      // If teamId is specified, set the opening bid at base price for that team
      if (teamId) {
        const team = await Team.findById(teamId);
        if (team) {
          state.currentBid = baseAmt;
          state.currentBidderTeam = team._id;
          state.currentBidderTeamName = team.name;
          state.currentBidderTeamLogo = team.logoUrl;
          state.bidHistory.unshift({
            team: team._id,
            teamName: team.name,
            teamLogo: team.logoUrl,
            amount: baseAmt,
            timestamp: new Date(),
          });
          await state.save();
          return Response.json({
            success: true,
            message: `Opening bid of ৳ ${baseAmt.toLocaleString()} started by ${team.name}!`,
            state,
          });
        }
      }

      // If no team specified, ensure previous bids are cleared so any team can make the opening bid
      state.currentBid = 0;
      state.currentBidderTeam = null;
      state.currentBidderTeamName = null;
      state.currentBidderTeamLogo = null;
      state.bidHistory = [];

      await state.save();
      return Response.json({
        success: true,
        message: `Bidding started for ${currP?.fullName || "current player"} at Base Price ৳ ${baseAmt.toLocaleString()}! Any team can now place the opening bid.`,
        state,
      });
    }

    if (action === "REVEAL_PLAYER") {
      state.hammerStatus = "waiting";
      state.timerEndAt = null;
      await state.save();
      return Response.json({
        success: true,
        message: `Showing player stage reveal screen.`,
        state,
      });
    }

    // ========================================================
    // 14. PAUSE / RESUME / STOP / RESET
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
        message: "Auction session stopped by admin.",
        state,
      });
    }

    if (action === "RESET") {
      if (scope === "CURRENT_PLAYER") {
        const currIdx = state.currentPlayerIndex;
        const currentP = state.players[currIdx];
        if (currentP) {
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
