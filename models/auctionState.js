import mongoose from "mongoose";

const queuedPlayerSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    orderIndex: { type: Number, required: true }, // 0 to 4 (1st to 5th)
    fullName: { type: String, required: true },
    photoUrl: { type: String, default: null },
    playerId: { type: String },
    registrationNumber: { type: String },
    session: { type: String },
    category: { type: String },
    role: { type: String, default: null },
    categories: { type: [String], default: [] },
    tier: { type: String },
    basePrice: { type: Number, default: 0 },
    soldPrice: { type: Number, default: null },
    soldToTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    soldToTeamName: { type: String, default: null },
    status: {
      type: String,
      enum: ["upcoming", "in_auction", "sold", "unsold"],
      default: "upcoming",
    },
  },
  { _id: false }
);

const bidRecordSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    teamName: { type: String, required: true },
    teamLogo: { type: String, default: null },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const auctionStateSchema = new mongoose.Schema(
  {
    auctionCode: { type: String, default: "LIVE", unique: true },
    status: {
      type: String,
      enum: ["idle", "in_progress", "paused", "completed"],
      default: "idle",
    },
    category: { type: String, default: null },
    tierId: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionTier", default: null },
    tierName: { type: String, default: null },
    tierBasePrice: { type: Number, default: 0 },
    players: { type: [queuedPlayerSchema], default: [] },
    currentPlayerIndex: { type: Number, default: 0 }, // 0 to 4
    currentBid: { type: Number, default: 0 },
    currentBidderTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    currentBidderTeamName: { type: String, default: null },
    currentBidderTeamLogo: { type: String, default: null },
    bidHistory: { type: [bidRecordSchema], default: [] },
    hammerStatus: {
      type: String,
      enum: ["waiting", "bidding_open", "going_once", "going_twice", "sold", "unsold"],
      default: "waiting",
    },
    timerSeconds: { type: Number, default: 15 },
    timerEndAt: { type: Date, default: null },
    player3SoldPrice: { type: Number, default: null },
    player4SoldPrice: { type: Number, default: null },
    fifthPlayerCalculatedBasePrice: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.AuctionState ?? mongoose.model("AuctionState", auctionStateSchema);
