import connectToDatabase from "../../../lib/mongodb";
import Fixture from "../../../models/fixture";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// GET: Fetch all fixtures (Only returns what admin added)
// ============================================
export const GET = async () => {
  try {
    await connectToDatabase();
    const fixtures = await Fixture.find().sort({ createdAt: 1 }).lean();
    return Response.json({ fixtures: fixtures || [] });
  } catch (error) {
    console.error("Fixtures GET error:", error);
    return Response.json({ fixtures: [] });
  }
};

// ============================================
// POST: Add new fixture (Admin only)
// ============================================
export const POST = async (request) => {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return Response.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const {
      matchNumber,
      stage,
      date,
      time,
      dayOfWeek,
      day,
      venue,
      pitch,
      format,
      status,
      team1,
      team2,
    } = body;

    if (!matchNumber?.trim() || !date?.trim() || !time?.trim()) {
      return Response.json({ error: "Match Number, Date, and Time are required." }, { status: 400 });
    }

    if (!team1?.name?.trim() || !team2?.name?.trim()) {
      return Response.json({ error: "Both Team 1 and Team 2 names are required." }, { status: 400 });
    }

    const newFixture = await Fixture.create({
      matchNumber: matchNumber.trim(),
      stage: stage?.trim() || "Group Stage • Pool A",
      date: date.trim(),
      time: time.trim(),
      dayOfWeek: dayOfWeek?.trim() || "",
      day: day?.trim() || "Day 1",
      venue: venue?.trim() || "Central Stadium, PSTU",
      pitch: pitch?.trim() || "PSTU Pitch #1",
      format: format?.trim() || "T10 Cricket (10 Overs)",
      status: status?.trim() || "Upcoming",
      team1: {
        name: team1.name.trim(),
        short: team1.short?.trim() || team1.name.slice(0, 3).toUpperCase(),
        color: team1.color || "from-blue-600 to-indigo-900",
        session: team1.session?.trim() || "",
      },
      team2: {
        name: team2.name.trim(),
        short: team2.short?.trim() || team2.name.slice(0, 3).toUpperCase(),
        color: team2.color || "from-amber-600 to-yellow-800",
        session: team2.session?.trim() || "",
      },
    });

    return Response.json({ success: true, fixture: newFixture }, { status: 201 });
  } catch (error) {
    console.error("Fixtures POST error:", error);
    return Response.json({ error: error.message || "Failed to create fixture." }, { status: 500 });
  }
};
