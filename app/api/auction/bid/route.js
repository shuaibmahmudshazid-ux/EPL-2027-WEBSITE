import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import Team from "../../../../models/team";
import { calculateNextBid, DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const POST = async (request) => {
  try {
    const body = await request.json();
    const { teamId, customAmount } = body;

    if (!teamId) {
      return Response.json({ error: "Team is required to bid." }, { status: 400 });
    }

    await connectToDatabase();

    const state = await AuctionState.findOne({ auctionCode: "LIVE" });
    if (!state || state.status !== "in_progress") {
      return Response.json(
        { error: "Auction is not currently active for bidding." },
        { status: 400 }
      );
    }

    if (!["bidding_open", "going_once", "going_twice"].includes(state.hammerStatus)) {
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

    // Verify team and remaining budget
    const team = await Team.findById(teamId).populate("players", "soldPrice");
    if (!team) {
      return Response.json({ error: "Team not found." }, { status: 404 });
    }

    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const pointsRemaining = Math.max(0, DEFAULT_TEAM_POINTS - pointsSpent);

    // Determine current player's base price
    let currentBase = state.tierBasePrice || 500;
    if (state.currentPlayerIndex === 4 && state.fifthPlayerCalculatedBasePrice) {
      currentBase = state.fifthPlayerCalculatedBasePrice;
    }

    const minNextBid = calculateNextBid(state.currentBid, currentBase);
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
