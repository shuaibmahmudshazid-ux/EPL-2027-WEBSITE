import mongoose from "mongoose";

const uri = "mongodb+srv://shuaibmahmudshazid_db_user:EPLAdmin2026Test@cluster0.an4nsiz.mongodb.net/epl_db?retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas (epl_db)...");

  // 1. Reset all Teams to 10,000 points and 0 spent, clear rosters
  const teamsUpdateResult = await mongoose.connection.db.collection("teams").updateMany(
    {},
    {
      $set: {
        points: 10000,
        pointsSpent: 0,
        players: [],
        status: "active",
      },
    }
  );
  console.log(`✅ Teams Reset: Updated ${teamsUpdateResult.modifiedCount} teams to 10,000 PTS and 0 spent.`);

  // 2. Reset all Players auction status to upcoming, clear team and soldPrice
  // KEEP tier, auctionTier, and basePrice as they are!
  const playersUpdateResult = await mongoose.connection.db.collection("players").updateMany(
    {},
    {
      $set: {
        auctionStatus: "upcoming",
        team: null,
        soldPrice: null,
      },
    }
  );
  console.log(`✅ Players Reset: Updated ${playersUpdateResult.modifiedCount} players to 'upcoming' with team=null & soldPrice=null.`);

  // 3. Keep auction tiers untouched and verify
  const tiers = await mongoose.connection.db.collection("auctiontiers").find({}).toArray();
  console.log(`✅ Auction Tiers Preserved: ${tiers.length} tiers in total:`);
  tiers.forEach((t) => {
    console.log(`   - ${t.category} | ${t.name}: Base Price ৳ ${t.basePrice}`);
  });

  // 4. Reset Live Auction State
  const stateUpdateResult = await mongoose.connection.db.collection("auctionstates").updateOne(
    { auctionCode: "LIVE" },
    {
      $set: {
        status: "idle",
        hammerStatus: "waiting",
        category: null,
        tierId: null,
        tierName: null,
        tierBasePrice: 0,
        players: [],
        currentPlayerIndex: 0,
        currentBid: 0,
        currentBidderTeam: null,
        currentBidderTeamName: null,
        currentBidderTeamLogo: null,
        bidHistory: [],
        timerSeconds: 20,
        timerEndAt: null,
        player3SoldPrice: null,
        player4SoldPrice: null,
        fifthPlayerCalculatedBasePrice: null,
        onlineBiddingEnabled: true,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log(`✅ Auction State Reset: status='idle', hammerStatus='waiting', currentBid=0.`);

  // 5. Verify Teams in DB
  const verifiedTeams = await mongoose.connection.db.collection("teams").find({}).project({ name: 1, points: 1, pointsSpent: 1, players: 1 }).toArray();
  console.log("\nVERIFIED TEAMS STATUS:");
  verifiedTeams.forEach((t) => {
    console.log(`   - ${t.name}: Points=${t.points}, Spent=${t.pointsSpent}, Players=${(t.players || []).length}`);
  });

  await mongoose.disconnect();
  console.log("\n✨ RESET COMPLETE: Auction is completely at initial state with 10,000 PTS per team!");
}

main().catch((err) => {
  console.error("❌ Reset Error:", err);
  process.exit(1);
});

