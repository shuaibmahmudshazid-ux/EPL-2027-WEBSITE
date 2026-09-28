import connectToDatabase from "../../../../lib/mongodb";
import Player from "../../../../models/player";

export const runtime = "nodejs";

export const GET = async (request) => {
  const playerId = new URL(request.url).searchParams.get("playerId")?.trim();
  if (!/^\d{7}$/.test(playerId || "")) return Response.json({ error: "Student ID must be exactly 7 digits." }, { status: 400 });
  await connectToDatabase();
  const existing = await Player.findOne({ playerId }).select("_id").lean();
  return Response.json({ available: !existing });
};
