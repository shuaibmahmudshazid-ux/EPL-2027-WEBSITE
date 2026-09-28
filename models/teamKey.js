import mongoose from "mongoose";

const teamKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, uppercase: true, unique: true },
    status: { type: String, enum: ["free", "used"], default: "free" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  },
  { timestamps: true },
);

export default mongoose.models.TeamKey ?? mongoose.model("TeamKey", teamKeySchema);
