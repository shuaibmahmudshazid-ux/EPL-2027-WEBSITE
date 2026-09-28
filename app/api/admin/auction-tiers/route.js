import connectToDatabase from "../../../../lib/mongodb";
import AuctionTier from "../../../../models/auctionTier";
import Player from "../../../../models/player";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// GET: Fetch all auction tiers with player counts
// ============================================
export const GET = async () => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  await connectToDatabase();

  const tiers = await AuctionTier.find()
    .sort({ category: 1, order: 1, name: 1 })
    .lean();

  const playerCounts = await Player.aggregate([
    { $match: { auctionTier: { $ne: null } } },
    { $group: { _id: "$auctionTier", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    playerCounts.map((item) => [item._id.toString(), item.count])
  );

  const enrichedTiers = tiers.map((tier) => ({
    ...tier,
    playerCount: countMap[tier._id.toString()] || 0,
  }));

  return Response.json({ tiers: enrichedTiers });
};

// ============================================
// POST: Create a new auction tier
// ============================================
export const POST = async (request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = body.name?.trim();
    const category = body.category?.trim();
    const basePrice = Number(body.basePrice) >= 0 ? Number(body.basePrice) : 0;
    const order = Number(body.order) || 0;
    const description = body.description?.trim() || "";

    if (!name || !category) {
      return Response.json(
        { error: "Tier name and category are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check duplicate name within the same category (case-insensitive)
    const existing = await AuctionTier.findOne({
      category: { $regex: new RegExp(`^${category}$`, "i") },
      name: { $regex: new RegExp(`^${name}$`, "i") },
    }).lean();

    if (existing) {
      return Response.json(
        { error: `Tier "${name}" already exists for category "${category}".` },
        { status: 409 }
      );
    }

    const tier = await AuctionTier.create({
      name,
      category,
      basePrice,
      order,
      description,
    });

    return Response.json({ tier }, { status: 201 });
  } catch (error) {
    console.error("CREATE_TIER_ERROR:", error);
    return Response.json(
      { error: error?.message || "Failed to create auction tier." },
      { status: 500 }
    );
  }
};
