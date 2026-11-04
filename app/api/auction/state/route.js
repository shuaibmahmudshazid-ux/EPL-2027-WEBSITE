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
    .populate("players", "fullName playerId categories playingRole soldPrice photoUrl session registrationNumber tier basePrice")
    .sort({ name: 1 })
    .lean();

  // Track which teams already acquired a player in the active tier queue
  const tierSoldPlayers = (state.players || []).filter((p) => p.status === "sold" && p.soldToTeam);

  const enrichedTeams = teams.map((team) => {
    // Combine team.players from DB and any sold players in active tier queue (deduplicated)
    const existingPlayerIds = new Set((team.players || []).map((p) => p._id?.toString() || p.id?.toString()));
    const activeTierPurchases = tierSoldPlayers
      .filter((p) => p.soldToTeam?.toString() === team._id?.toString())
      .map((p) => ({
        _id: p.player,
        fullName: p.fullName,
        photoUrl: p.photoUrl,
        categories: Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : [p.category].filter(Boolean),
        playingRole: p.role || p.category,
        tier: p.tier,
        soldPrice: p.soldPrice,
        playerId: p.playerId,
        session: p.session,
        registrationNumber: p.registrationNumber,
      }));

    const allTeamPlayers = [...(team.players || [])];
    for (const atp of activeTierPurchases) {
      if (!existingPlayerIds.has(atp._id?.toString())) {
        allTeamPlayers.push(atp);
        existingPlayerIds.add(atp._id?.toString());
      }
    }

    const pointsSpent = allTeamPlayers.reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const totalPoints = typeof team.points === "number" ? team.points : DEFAULT_TEAM_POINTS;
    const pointsRemaining = Math.max(0, totalPoints - pointsSpent);

    const acquiredInTier = tierSoldPlayers.find(
      (p) => p.soldToTeam?.toString() === team._id?.toString()
    );

    return {
      _id: team._id,
      name: team.name,
      uniqueKey: team.uniqueKey,
      logoUrl: team.logoUrl,
      managers: team.managers,
      playerCount: allTeamPlayers.length,
      players: allTeamPlayers,
      pointsSpent,
      pointsRemaining,
      totalPoints,
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
  const currentActivePlayer = state.players?.[state.currentPlayerIndex];
  let currentBase = currentActivePlayer?.basePrice || state.tierBasePrice || 500;
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
