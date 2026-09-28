import mongoose from "mongoose";

const auctionTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    basePrice: { type: Number, default: 0, min: 0 },
    order: { type: Number, default: 0 },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

auctionTierSchema.index({ category: 1, name: 1 }, { unique: true });

export default mongoose.models.AuctionTier ?? mongoose.model("AuctionTier", auctionTierSchema);
