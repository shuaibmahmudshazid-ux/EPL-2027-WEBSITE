import connectToDatabase from "../../../../lib/mongodb";
import Player from "../../../../models/player";
import Team from "../../../../models/team";
import AuctionTier from "../../../../models/auctionTier";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const PATCH = async (request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const body = await request.json();
  const { status, tierId, auctionTier } = body;

  const updateFields = {};

  if (status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    updateFields.status = status;
  }

  await connectToDatabase();

  const targetTierId = tierId !== undefined ? tierId : auctionTier;
  if (targetTierId !== undefined) {
    if (!targetTierId || targetTierId === "__none" || targetTierId === "unassigned") {
      updateFields.auctionTier = null;
      updateFields.tier = null;
    } else {
      const tier = await AuctionTier.findById(targetTierId).lean();
      if (!tier) {
        return Response.json({ error: "Auction tier not found." }, { status: 404 });
      }
      updateFields.auctionTier = tier._id;
      updateFields.tier = tier.name;
      updateFields.basePrice = tier.basePrice;
    }
  }

  const { id } = await params;
  const player = await Player.findByIdAndUpdate(id, { $set: updateFields }, { returnDocument: "after" })
    .populate("team", "name")
    .populate("auctionTier", "name category basePrice")
    .lean();

  if (!player) return Response.json({ error: "Player not found." }, { status: 404 });
  return Response.json({ player });
};

export const DELETE = async (_request, { params }) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();
  const player = await Player.findByIdAndDelete(id).lean();
  if (!player) return Response.json({ error: "Player not found." }, { status: 404 });

  await Team.updateMany({ players: player._id }, { $pull: { players: player._id } });
  return Response.json({ message: "Player deleted." });
};
