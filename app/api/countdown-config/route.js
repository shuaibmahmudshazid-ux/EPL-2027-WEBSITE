import connectToDatabase from "../../../lib/mongodb";
import CountdownConfig from "../../../models/countdownConfig";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Default fallback: 30 minutes from now or previously saved target
const DEFAULT_TARGET_MS = 1793880800000; // 2026-11-05T12:13:20.000Z

export const GET = async () => {
  try {
    await connectToDatabase();
    let config = await CountdownConfig.findOne().sort({ updatedAt: -1 }).lean();
    if (!config) {
      config = {
        targetDate: new Date(DEFAULT_TARGET_MS),
        title: "Official Player Auction",
        subtitle: "",
      };
    }
    return Response.json({
      targetDate: config.targetDate,
      targetTimestamp: new Date(config.targetDate).getTime(),
      title: config.title,
      subtitle: config.subtitle,
    });
  } catch (error) {
    console.error("GET /api/countdown-config error:", error);
    return Response.json(
      {
        targetDate: new Date(DEFAULT_TARGET_MS),
        targetTimestamp: DEFAULT_TARGET_MS,
        title: "Official Player Auction",
        subtitle: "",
      },
      { status: 200 }
    );
  }
};

export const PUT = async (request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { targetDate, targetTimestamp, minutesFromNow, title, subtitle } = body;

    let finalTargetDate = null;
    if (minutesFromNow !== undefined && !Number.isNaN(Number(minutesFromNow))) {
      finalTargetDate = new Date(Date.now() + Math.max(1, Number(minutesFromNow)) * 60 * 1000);
    } else if (targetTimestamp) {
      finalTargetDate = new Date(Number(targetTimestamp));
    } else if (targetDate) {
      finalTargetDate = new Date(targetDate);
    }

    if (!finalTargetDate || Number.isNaN(finalTargetDate.getTime())) {
      return Response.json(
        { error: "Invalid target date or timestamp provided." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updated = await CountdownConfig.findOneAndUpdate(
      {},
      {
        $set: {
          targetDate: finalTargetDate,
          ...(title !== undefined ? { title: String(title).trim() } : {}),
          ...(subtitle !== undefined ? { subtitle: String(subtitle).trim() } : {}),
          updatedBy: session.username || "admin",
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    return Response.json({
      success: true,
      targetDate: updated.targetDate,
      targetTimestamp: new Date(updated.targetDate).getTime(),
      title: updated.title,
      subtitle: updated.subtitle,
    });
  } catch (error) {
    console.error("PUT /api/countdown-config error:", error);
    return Response.json(
      { error: error.message || "Failed to update countdown settings." },
      { status: 500 }
    );
  }
};

