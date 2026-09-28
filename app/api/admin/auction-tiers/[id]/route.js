import connectToDatabase from "../../../../../lib/mongodb";
import AuctionTier from "../../../../../models/auctionTier";
import Player from "../../../../../models/player";
import { getSession } from "../../../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// PATCH: Update an auction tier
// ============================================
export const PATCH = async (request, { params }) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const name = body.name?.trim();
  const category = body.category?.trim();
  const basePrice = body.basePrice !== undefined ? Math.max(0, Number(body.basePrice)) : undefined;
  const order = body.order !== undefined ? Number(body.order) : undefined;
  const description = body.description !== undefined ? body.description.trim() : undefined;

  await connectToDatabase();

  const tier = await AuctionTier.findById(id);
  if (!tier) {
    return Response.json({ error: "Auction tier not found." }, { status: 404 });
  }

  // If changing name or category, check for conflict
  if (
    (name && name.toLowerCase() !== tier.name.toLowerCase()) ||
    (category && category.toLowerCase() !== tier.category.toLowerCase())
  ) {
    const checkCat = category || tier.category;
    const checkName = name || tier.name;
    const conflict = await AuctionTier.findOne({
      _id: { $ne: id },
      category: { $regex: new RegExp(`^${checkCat}$`, "i") },
      name: { $regex: new RegExp(`^${checkName}$`, "i") },
    }).lean();

    if (conflict) {
      return Response.json(
        { error: `Tier "${checkName}" already exists for category "${checkCat}".` },
        { status: 409 }
      );
    }
  }

  if (name !== undefined) tier.name = name;
  if (category !== undefined) tier.category = category;
  if (basePrice !== undefined) tier.basePrice = basePrice;
  if (order !== undefined) tier.order = order;
  if (description !== undefined) tier.description = description;

  await tier.save();

  // Keep player sync: update players with this tier ID
  const playerUpdates = {};
  if (name !== undefined) playerUpdates.tier = tier.name;
  if (basePrice !== undefined) playerUpdates.basePrice = tier.basePrice;

  if (Object.keys(playerUpdates).length > 0) {
    await Player.updateMany({ auctionTier: id }, { $set: playerUpdates });
  }

  return Response.json({ tier });
};

// ============================================
// DELETE: Delete an auction tier & unassign players
// ============================================
export const DELETE = async (_request, { params }) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  await connectToDatabase();

  const tier = await AuctionTier.findByIdAndDelete(id).lean();
  if (!tier) {
    return Response.json({ error: "Auction tier not found." }, { status: 404 });
  }

  // Unassign all players assigned to this tier
  await Player.updateMany(
    { auctionTier: id },
    { $set: { auctionTier: null, tier: null } }
  );

  return Response.json({
    message: `Tier "${tier.name}" deleted and assigned players unassigned.`,
  });
};
