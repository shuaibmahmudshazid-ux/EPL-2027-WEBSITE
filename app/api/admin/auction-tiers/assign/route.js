import connectToDatabase from "../../../../../lib/mongodb";
import AuctionTier from "../../../../../models/auctionTier";
import Player from "../../../../../models/player";
import { getSession } from "../../../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// POST: Assign or unassign players to/from tier
// Body: { tierId, playerIds, action: "assign" | "unassign" }
// ============================================
export const POST = async (request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { tierId, playerIds, action = "assign" } = await request.json();

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return Response.json(
        { error: "No players specified." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    if (action === "assign") {
      if (!tierId) {
        return Response.json(
          { error: "Tier ID is required for assignment." },
          { status: 400 }
        );
      }

      const tier = await AuctionTier.findById(tierId).lean();
      if (!tier) {
        return Response.json(
          { error: "Auction tier not found." },
          { status: 404 }
        );
      }

      const result = await Player.updateMany(
        { _id: { $in: playerIds } },
        {
          $set: {
            auctionTier: tier._id,
            tier: tier.name,
            basePrice: tier.basePrice,
          },
        }
      );

      return Response.json({
        success: true,
        message: `Assigned ${result.modifiedCount} player(s) to ${tier.name}.`,
        modifiedCount: result.modifiedCount,
      });
    }

    if (action === "unassign") {
      const result = await Player.updateMany(
        { _id: { $in: playerIds } },
        {
          $set: {
            auctionTier: null,
            tier: null,
          },
        }
      );

      return Response.json({
        success: true,
        message: `Unassigned ${result.modifiedCount} player(s).`,
        modifiedCount: result.modifiedCount,
      });
    }

    return Response.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("TIER_ASSIGNMENT_ERROR:", error);
    return Response.json(
      { error: error?.message || "Failed to update player tiers." },
      { status: 500 }
    );
  }
};
