import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import Team from "../../../../models/team";
import { calculateNextBid, DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const POST = async (request) => {
  try {
    const body = await request.json();
    let { teamId, uniqueKey, customAmount } = body;

    await connectToDatabase();

    let team = null;
    if (teamId) {
      team = await Team.findById(teamId).populate("players", "soldPrice");
    } else if (uniqueKey) {
      team = await Team.findOne({ uniqueKey: uniqueKey.trim().toUpperCase() }).populate("players", "soldPrice");
    }

    if (!team) {
      return Response.json({ error: "Team is required to bid. Please log in with your team key." }, { status: 400 });
    }
    teamId = team._id.toString();

    const state = await AuctionState.findOne({ auctionCode: "LIVE" });
    if (!state || (state.status !== "in_progress" && state.status !== "active")) {
      return Response.json(
        { error: "Auction is not currently active for bidding." },
        { status: 400 }
      );
    }

    if (!["waiting", "bidding_open", "going_once", "going_twice"].includes(state.hammerStatus)) {
      return Response.json(
        { error: "Bidding is closed for this player." },
        { status: 400 }
      );
    }

    // Prevent team from bidding against themselves
    if (state.currentBidderTeam && state.currentBidderTeam.toString() === teamId.toString()) {
      return Response.json(
        { error: "Your team is already the highest bidder!" },
        { status: 400 }
      );
    }

    // Rule: After acquiring a player in a tier, the same team cannot bid until next tier
    const alreadyAcquiredInTier = (state.players || []).find(
      (p) =>
        p.status === "sold" &&
        p.soldToTeam &&
        p.soldToTeam.toString() === teamId.toString()
    );

    if (alreadyAcquiredInTier) {
      return Response.json(
        {
          error: `Tier Quota Reached: ${team.name} already acquired ${alreadyAcquiredInTier.fullName} in this tier (${state.tierName || "Current Tier"}). You cannot bid again until the next tier begins!`,
        },
        { status: 400 }
      );
    }

    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const totalPoints = typeof team.points === "number" ? team.points : DEFAULT_TEAM_POINTS;
    const pointsRemaining = Math.max(0, totalPoints - pointsSpent);

    // Determine current player's base price
    const currentActivePlayer = state.players?.[state.currentPlayerIndex];
    let currentBase = currentActivePlayer?.basePrice || state.tierBasePrice || 500;
    if (state.currentPlayerIndex === 4 && state.fifthPlayerCalculatedBasePrice) {
      currentBase = state.fifthPlayerCalculatedBasePrice;
    }

    // If no bids placed yet, opening bid starts at the player base price
    let minNextBid;
    if (!state.currentBidderTeam || state.currentBid <= 0) {
      minNextBid = currentBase;
    } else {
      minNextBid = calculateNextBid(state.currentBid, currentBase);
    }
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
    state.hammerStatus = "bidding_open"; // Reset hammer count on new bid
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
