import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(MONGODB_URI, { dbName: "epl_db" });
  const db = mongoose.connection.db;

  const teams = await db.collection("teams").find({}, { projection: { name: 1, points: 1, pointsSpent: 1, players: 1 } }).toArray();
  console.log("TEAMS:");
  teams.forEach(t => console.log(` - ${t.name}: points=${t.points}, spent=${t.pointsSpent}, squadCount=${(t.players || []).length}`));

  const tiers = await db.collection("auctiontiers").find({}).sort({ order: 1 }).toArray();
  console.log("\nTIERS COUNT:", tiers.length);
  tiers.forEach(tr => console.log(` - [Order ${tr.order}] ${tr.name} (${tr.category || 'N/A'}): Base Price ৳ ${tr.basePrice}`));

  const iconPlayers = await db.collection("players").find({ auctionTier: "ICON PLAYER" }).toArray();
  console.log("\nICON PLAYERS COUNT:", iconPlayers.length);
  iconPlayers.forEach(p => console.log(` - ${p.name} (${p.category || p.playingRole})`));

  const auctionState = await db.collection("auctionstates").findOne({});
  console.log("\nAUCTION STATE:", auctionState ? {
    status: auctionState.status,
    hammerStatus: auctionState.hammerStatus,
    currentBid: auctionState.currentBid,
    currentPlayer: auctionState.currentPlayer,
    bidsCount: auctionState.bidHistory?.length || 0
  } : "No state document found");

  await mongoose.disconnect();
}

check().catch(console.error);
