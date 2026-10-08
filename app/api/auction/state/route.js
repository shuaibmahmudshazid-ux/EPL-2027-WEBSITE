import connectToDatabase from "../../../../lib/mongodb";
import AuctionState from "../../../../models/auctionState";
import Team from "../../../../models/team";
import Player from "../../../../models/player";
import "../../../../models/auctionTier";
import { calculateNextBid, DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const GET = async () => {
  await connectToDatabase();

  let state = await AuctionState.findOne({ auctionCode: "LIVE" }).lean();
  if (!state) {
    state = await AuctionState.create({
      auctionCode: "LIVE",
      status: "idle",
      hammerStatus: "waiting",
    });
    state = state.toObject();
  }

  // Fetch all active teams with populated player summaries
  const teams = await Team.find({ status: "active" })
    .populate("players", "fullName playerId categories soldPrice photoUrl session registrationNumber")
    .sort({ name: 1 })
    .lean();

  // Track which teams already acquired a player in the active tier queue
  const tierSoldPlayers = (state.players || []).filter((p) => p.status === "sold" && p.soldToTeam);

  const enrichedTeams = teams.map((team) => {
    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const pointsRemaining = Math.max(0, DEFAULT_TEAM_POINTS - pointsSpent);

    const acquiredInTier = tierSoldPlayers.find(
      (p) => p.soldToTeam?.toString() === team._id?.toString()
    );

    return {
      _id: team._id,
      name: team.name,
      uniqueKey: team.uniqueKey,
      logoUrl: team.logoUrl,
      managers: team.managers,
      playerCount: (team.players || []).length,
      players: team.players || [],
      pointsSpent,
      pointsRemaining,
      totalPoints: DEFAULT_TEAM_POINTS,
      hasWonInCurrentTier: Boolean(acquiredInTier),
      wonPlayerInCurrentTier: acquiredInTier
        ? {
            fullName: acquiredInTier.fullName,
            soldPrice: acquiredInTier.soldPrice,
          }
        : null,
    };
  });

  // Fetch all players that have been auctioned (sold or unsold)
  const auctionedPlayers = await Player.find({
    auctionStatus: { $in: ["sold", "unsold"] },
  })
    .populate("team", "name logoUrl")
    .populate("auctionTier", "name category basePrice")
    .sort({ updatedAt: -1 })
    .lean();

  const soldPlayers = auctionedPlayers.filter((p) => p.auctionStatus === "sold");
  const totalSpend = soldPlayers.reduce((sum, p) => sum + (Number(p.soldPrice) || 0), 0);
  const highestBidPlayer = soldPlayers.reduce((max, p) => (!max || p.soldPrice > max.soldPrice ? p : max), null);

  const auctionStats = {
    totalSold: soldPlayers.length,
    totalUnsold: auctionedPlayers.length - soldPlayers.length,
    totalSpend,
    highestBid: highestBidPlayer?.soldPrice || 0,
    highestBidPlayer: highestBidPlayer ? {
      name: highestBidPlayer.fullName,
      photoUrl: highestBidPlayer.photoUrl,
      amount: highestBidPlayer.soldPrice,
      teamName: highestBidPlayer.team?.name || "—",
      category: highestBidPlayer.categories?.[0] || "—",
    } : null,
    averagePrice: soldPlayers.length > 0 ? Math.round(totalSpend / soldPlayers.length) : 0,
  };

  // Calculate next bid for current player
  let currentBase = state.tierBasePrice || 500;
  if (state.currentPlayerIndex === 4 && state.fifthPlayerCalculatedBasePrice) {
    currentBase = state.fifthPlayerCalculatedBasePrice;
  }
  const nextMinimumBid = calculateNextBid(state.currentBid, currentBase);

  return Response.json({
    state,
    teams: enrichedTeams,
    auctionedPlayers,
    auctionStats,
    nextMinimumBid,
    defaultTeamPoints: DEFAULT_TEAM_POINTS,
  });
};
