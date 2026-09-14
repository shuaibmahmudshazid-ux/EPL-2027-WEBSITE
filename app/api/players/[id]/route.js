import connectToDatabase from "../../../../lib/mongodb";
import Player from "../../../../models/player";
import "../../../../models/team";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const PATCH = async (request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const { status } = await request.json();
  if (!["pending", "approved", "rejected"].includes(status)) return Response.json({ error: "Invalid status." }, { status: 400 });
  const { id } = await params;
  await connectToDatabase();
  const player = await Player.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).populate("team", "name").lean();
  if (!player) return Response.json({ error: "Player not found." }, { status: 404 });
  return Response.json({ player });
};
