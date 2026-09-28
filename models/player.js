import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    playerId: { type: String, required: true, trim: true, unique: true },
    registrationNumber: { type: String, trim: true, default: null },
    paymentMethod: { type: String, enum: ["bkash", "nagad", "rocket", "cash", "other"], default: null },
    transactionId: { type: String, trim: true, default: null },
    cashReceivedBy: { type: String, trim: true, default: null },
    paymentNote: { type: String, trim: true, default: null },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    session: { type: String, required: true },
    categories: {
      type: [String],
      required: true,
      validate: (value) => value.length > 0,
    },
    photoUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    tier: { type: String, trim: true, default: null },
    auctionTier: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionTier", default: null },
    basePrice: { type: Number, default: 0 },
    soldPrice: { type: Number, default: null },
    auctionStatus: {
      type: String,
      enum: ["upcoming", "in_auction", "sold", "unsold"],
      default: "upcoming",
    },
    auctionOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Player ?? mongoose.model("Player", playerSchema);
