import mongoose from "mongoose";

const countdownConfigSchema = new mongoose.Schema(
  {
    targetDate: { type: Date, required: true },
    title: { type: String, default: "Official Player Auction" },
    subtitle: { type: String, default: "" },
    updatedBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.models.CountdownConfig ?? mongoose.model("CountdownConfig", countdownConfigSchema);

