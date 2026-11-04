import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import Team from "../../../../models/team";
import { calculateNextBid, DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  try {
    const body = await request.json();
    const { teamId, uniqueKey, teamName, customAmount } = body;

    await connectToDatabase();

    const state = await AuctionState.findOne({ auctionCode: "LIVE" });
    if (!state || state.status !== "in_progress") {
      return Response.json(
        { error: "Auction is not currently active for bidding." },
        { status: 400 }
      );
    }

    // Check if online bidding is disabled by Admin (unless called by admin)
    const adminSession = await getSession();
    if (!adminSession && state.onlineBiddingEnabled === false) {
      return Response.json(
        { error: "Online bidding is disabled by the Admin. Bids are placed live via the auctioneer." },
        { status: 403 }
      );
    }

    if (!["bidding_open", "waiting", "going_once", "going_twice"].includes(state.hammerStatus)) {
      return Response.json(
        { error: "Bidding is currently closed for this player." },
        { status: 400 }
      );
    }

    // Resolve team by teamId, uniqueKey, OR teamName
    let team = null;
    if (teamId && mongoose.isValidObjectId(teamId)) {
      try {
        team = await Team.findById(teamId).populate("players", "soldPrice fullName");
      } catch {
        team = null;
      }
    }
    if (!team && uniqueKey && typeof uniqueKey === "string" && uniqueKey.trim()) {
      team = await Team.findOne({ uniqueKey: uniqueKey.trim().toUpperCase() }).populate("players", "soldPrice fullName");
    }
    if (!team && teamName && typeof teamName === "string" && teamName.trim()) {
      team = await Team.findOne({ name: new RegExp(`^${teamName.trim()}$`, "i") }).populate("players", "soldPrice fullName");
    }

    if (!team) {
      return Response.json(
        { error: "Team not found. Please log in with your team key." },
        { status: 404 }
      );
    }

    // Check if a team has already placed a bid for the active athlete
    const hasPreviousBidder = Boolean(
      state.currentBidderTeam ||
      state.currentBidderTeamName ||
      (Array.isArray(state.bidHistory) && state.bidHistory.length > 0)
    );

    // Prevent team from bidding against themselves ONLY if they are already the highest bidder
    if (
      hasPreviousBidder &&
      state.currentBidderTeam &&
      state.currentBidderTeam.toString() === team._id.toString()
    ) {
      return Response.json(
        { error: `${team.name} is already the highest bidder!` },
        { status: 400 }
      );
    }

    // Quota rule: only enforce tier quota if in a formal 5-player tier auction
    if (state.tierId && Array.isArray(state.players) && state.players.length === 5) {
      const alreadyAcquiredInTier = state.players.find(
        (p) =>
          p.status === "sold" &&
          p.soldToTeam &&
          p.soldToTeam.toString() === team._id.toString()
      );

      if (alreadyAcquiredInTier) {
        return Response.json(
          {
            error: `Tier Quota Reached: ${team.name} already acquired ${alreadyAcquiredInTier.fullName} in this tier (${state.tierName || "Current Tier"}). You cannot bid again until the next tier begins!`,
          },
          { status: 400 }
        );
      }
    }

    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const pointsRemaining = Math.max(0, DEFAULT_TEAM_POINTS - pointsSpent);

    // Determine current player's base price
    let currentBase = state.tierBasePrice || 500;
    const currP = state.players?.[state.currentPlayerIndex];
    if (currP && currP.basePrice > 0) {
      currentBase = currP.basePrice;
    }
    if (state.currentPlayerIndex === 4 && state.fifthPlayerCalculatedBasePrice) {
      currentBase = state.fifthPlayerCalculatedBasePrice;
    }

    // If no team has placed a bid yet, the opening bid is EXACTLY base price!
    // If a bid has already been placed, apply increment rules (+500 under 10k, +2000 at/above 10k)
    const minNextBid = hasPreviousBidder ? calculateNextBid(state.currentBid, currentBase) : currentBase;
    const bidAmount = customAmount ? Math.max(minNextBid, Number(customAmount)) : minNextBid;

    // Check if team has enough points
    if (bidAmount > pointsRemaining) {
      return Response.json(
        {
          error: `Insufficient points! You need ৳ ${bidAmount.toLocaleString()}, but ${team.name} only has ৳ ${pointsRemaining.toLocaleString()} remaining.`,
        },
        { status: 400 }
      );
    }

    // Update auction state with new bid
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
      message: `${team.name} placed a bid of ৳ ${bidAmount.toLocaleString()}`,
      bidAmount,
      teamName: team.name,
    });
  } catch (error) {
    console.error("AUCTION_BID_ERROR:", error);
    return Response.json(
      { error: error?.message || "Failed to place bid." },
      { status: 500 }
    );
  }
};
