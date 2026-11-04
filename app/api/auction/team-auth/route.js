import connectToDatabase from "../../../../lib/mongodb";
import Team from "../../../../models/team";
import { DEFAULT_TEAM_POINTS } from "../../../../lib/auctionRules";

export const runtime = "nodejs";

export const POST = async (request) => {
  try {
    const { uniqueKey } = await request.json();
    if (!uniqueKey || !uniqueKey.trim()) {
      return Response.json({ error: "Team Unique Key is required." }, { status: 400 });
    }

    await connectToDatabase();

    const normalizedKey = uniqueKey.trim().toUpperCase();
    const team = await Team.findOne({ uniqueKey: normalizedKey })
      .populate(
        "players",
        "fullName playerId categories playingRole soldPrice photoUrl session registrationNumber tier basePrice"
      )
      .lean();

    if (!team) {
      return Response.json({ error: "Invalid Team Key. Team not found." }, { status: 404 });
    }

    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const totalPoints = typeof team.points === "number" ? team.points : DEFAULT_TEAM_POINTS;
    const pointsRemaining = Math.max(0, totalPoints - pointsSpent);

    return Response.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        uniqueKey: team.uniqueKey,
        logoUrl: team.logoUrl,
        pointsRemaining,
        pointsSpent,
        totalPoints,
        playerCount: (team.players || []).length,
        players: team.players || [],
      },
    });
  } catch (error) {
    console.error("TEAM_AUTH_ERROR:", error);
    return Response.json({ error: "Failed to authenticate team." }, { status: 500 });
  }
};
