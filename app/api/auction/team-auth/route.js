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
      .populate("players", "soldPrice fullName")
      .lean();

    if (!team) {
      return Response.json({ error: "Invalid Team Key. Team not found." }, { status: 404 });
    }

    const pointsSpent = (team.players || []).reduce(
      (sum, p) => sum + (Number(p.soldPrice) || 0),
      0
    );
    const pointsRemaining = Math.max(0, DEFAULT_TEAM_POINTS - pointsSpent);

    return Response.json({
      success: true,
      team: {
        _id: team._id,
        name: team.name,
        uniqueKey: team.uniqueKey,
        logoUrl: team.logoUrl,
        pointsRemaining,
        pointsSpent,
        totalPoints: DEFAULT_TEAM_POINTS,
        playerCount: (team.players || []).length,
      },
    });
  } catch (error) {
    console.error("TEAM_AUTH_ERROR:", error);
    return Response.json({ error: "Failed to authenticate team." }, { status: 500 });
  }
};
