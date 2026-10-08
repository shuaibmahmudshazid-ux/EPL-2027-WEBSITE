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
  const { status, tierId, auctionTier, teamId, soldPrice } = body;

  const updateFields = {};

  if (status !== undefined) {
    if (!["pending", "approved", "rejected"].includes(status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    updateFields.status = status;
  }

  await connectToDatabase();
  const { id } = await params;
  const existingPlayer = await Player.findById(id);
  if (!existingPlayer) return Response.json({ error: "Player not found." }, { status: 404 });

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

  // Handle Team Assignment / Unassignment
  if (teamId !== undefined) {
    if (!teamId || teamId === "__unassign" || teamId === "none" || teamId === "__none") {
      if (existingPlayer.team) {
        await Team.findByIdAndUpdate(existingPlayer.team, {
          $pull: { players: existingPlayer._id },
        });
      }
      updateFields.team = null;
      updateFields.soldPrice = null;
      updateFields.auctionStatus = "upcoming";
    } else {
      const targetTeam = await Team.findById(teamId);
      if (!targetTeam) {
        return Response.json({ error: "Team not found." }, { status: 404 });
      }
      if (existingPlayer.team && existingPlayer.team.toString() !== targetTeam._id.toString()) {
        await Team.findByIdAndUpdate(existingPlayer.team, {
          $pull: { players: existingPlayer._id },
        });
      }
      await Team.findByIdAndUpdate(targetTeam._id, {
        $addToSet: { players: existingPlayer._id },
      });
      updateFields.team = targetTeam._id;
      const finalPrice = soldPrice !== undefined ? Number(soldPrice) : (existingPlayer.soldPrice || existingPlayer.basePrice || 0);
      updateFields.soldPrice = finalPrice;
      updateFields.auctionStatus = "sold";
    }
  } else if (soldPrice !== undefined && existingPlayer.team) {
    updateFields.soldPrice = Number(soldPrice);
  }

  const player = await Player.findByIdAndUpdate(id, { $set: updateFields }, { returnDocument: "after" })
    .populate("team", "name logoUrl")
    .populate("auctionTier", "name category basePrice")
    .lean();

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
