import mongoose from "mongoose";

const fixtureSchema = new mongoose.Schema(
  {
    matchNumber: { type: String, required: true }, // e.g. "Match 01"
    stage: { type: String, default: "Group Stage" }, // e.g. "Group Stage • Pool A"
    date: { type: String, required: true }, // e.g. "12 Oct 2026"
    time: { type: String, required: true }, // e.g. "09:30 AM"
    dayOfWeek: { type: String, default: "" }, // e.g. "Monday"
    day: { type: String, default: "Day 1" }, // e.g. "Day 1", "Day 2", "Playoffs"
    venue: { type: String, default: "Central Stadium, PSTU" },
    pitch: { type: String, default: "PSTU Pitch #1" },
    format: { type: String, default: "T10 Cricket (10 Overs)" },
    status: { type: String, default: "Upcoming" }, // "Upcoming", "Live", "Completed"
    team1: {
      name: { type: String, required: true },
      short: { type: String, default: "" },
      color: { type: String, default: "from-blue-600 to-indigo-900" },
      session: { type: String, default: "" },
    },
    team2: {
      name: { type: String, required: true },
      short: { type: String, default: "" },
      color: { type: String, default: "from-amber-600 to-yellow-800" },
      session: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Fixture ?? mongoose.model("Fixture", fixtureSchema);
