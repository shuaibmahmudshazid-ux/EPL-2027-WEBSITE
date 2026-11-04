import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function updateBasePrices() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(MONGODB_URI, { dbName: "epl_db" });
  console.log("Connected to MongoDB epl_db");

  const tiersCollection = mongoose.connection.db.collection("auctiontiers");
  const playersCollection = mongoose.connection.db.collection("players");

  const tiers = await tiersCollection.find({}).toArray();
  console.log(`Found ${tiers.length} tiers to process.\n`);

  for (const tier of tiers) {
    const cat = (tier.category || "").trim().toLowerCase();
    const name = (tier.name || "").trim().toLowerCase();

    let targetPrice = tier.basePrice;

    // 1. Icon Player -> 600
    if (cat.includes("icon") || name.includes("icon")) {
      targetPrice = 600;
    }
    // 2. Platinum Wicket Keeper -> 400
    else if (cat.includes("wicket") && name.includes("platinum")) {
      targetPrice = 400;
    }
    // 3. All other Platinum -> 500
    else if (name.includes("platinum")) {
      targetPrice = 500;
    }
    // 4. All Diamond -> 400
    else if (name.includes("diamond")) {
      targetPrice = 400;
    }
    // 5. All Gold -> 300
    else if (name.includes("gold")) {
      targetPrice = 300;
    }
    // 6. All Silver -> 250
    else if (name.includes("silver")) {
      targetPrice = 250;
    }

    console.log(`Updating Tier: [${tier.category}] ${tier.name} -> Base Price: ৳${targetPrice} (was ৳${tier.basePrice})`);

    await tiersCollection.updateOne(
      { _id: tier._id },
      { $set: { basePrice: targetPrice, updatedAt: new Date() } }
    );

    // Update basePrice for all players assigned to this tier
    const res = await playersCollection.updateMany(
      {
        $or: [
          { auctionTier: tier._id },
          { auctionTier: tier._id.toString() },
          { tier: tier.name, categories: tier.category }
        ]
      },
      {
        $set: { basePrice: targetPrice, updatedAt: new Date() }
      }
    );

    console.log(`   -> Synchronized ${res.modifiedCount} player(s) in this tier to ৳${targetPrice}`);
  }

  console.log("\n=================================");
  console.log("FINAL VERIFICATION OF TIERS:");
  console.log("=================================");
  const updatedTiers = await tiersCollection.find({}).sort({ category: 1, name: 1 }).toArray();
  for (const t of updatedTiers) {
    const pCount = await playersCollection.countDocuments({
      $or: [{ auctionTier: t._id }, { auctionTier: t._id.toString() }]
    });
    console.log(`- [${t.category}] ${t.name}: ৳${t.basePrice} (${pCount} players)`);
  }

  await mongoose.disconnect();
}

updateBasePrices().catch((err) => {
  console.error(err);
  process.exit(1);
});

