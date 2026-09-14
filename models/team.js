import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { _id: false },
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    uniqueKey: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    managers: {
      type: [managerSchema],
      required: true,
      validate: (value) => value.length > 0,
    },
    logoUrl: { type: String, default: null },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

export default mongoose.models.Team ?? mongoose.model("Team", teamSchema);
