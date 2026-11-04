import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const iconPlayersData = [
  {
    fullName: "ASHADUZZAMAN",
    playerId: "2206001",
    phone: "01700000001",
    email: "ashaduzzaman.icon@epl.local",
    session: "2022-2023",
    categories: ["ICON PLAYER"],
    playingRole: "Batsman",
    isIcon: true,
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488313/epl_gallery/bfyrtbnijcmvrygpentz.jpg",
    tier: "ICON PLAYER",
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab"),
    basePrice: 1000,
    status: "approved",
    auctionStatus: "upcoming",
    auctionOrder: 1,
  },
  {
    fullName: "IBRAHIM FAHAD",
    playerId: "2206002",
    phone: "01700000002",
    email: "ibrahim.fahad.icon@epl.local",
    session: "2022-2023",
    categories: ["ICON PLAYER"],
    playingRole: "All-Rounder",
    isIcon: true,
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488334/epl_gallery/a2rgxlgd7hdsf7ryplcu.jpg",
    tier: "ICON PLAYER",
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab"),
    basePrice: 1000,
    status: "approved",
    auctionStatus: "upcoming",
    auctionOrder: 2,
  },
  {
    fullName: "MASUD TAHA",
    playerId: "2206003",
    phone: "01700000003",
    email: "masud.taha.icon@epl.local",
    session: "2022-2023",
    categories: ["ICON PLAYER"],
    playingRole: "All-Rounder",
    isIcon: true,
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488300/epl_gallery/oqz8unetdw59kup8vjnx.jpg",
    tier: "ICON PLAYER",
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab"),
    basePrice: 1000,
    status: "approved",
    auctionStatus: "upcoming",
    auctionOrder: 3,
  },
  {
    fullName: "SAGOR DAS",
    playerId: "2206004",
    phone: "01700000004",
    email: "sagor.das.icon@epl.local",
    session: "2022-2023",
    categories: ["ICON PLAYER"],
    playingRole: "Bowler",
    isIcon: true,
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488324/epl_gallery/haumsr7y52v33n9llgh8.jpg",
    tier: "ICON PLAYER",
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab"),
    basePrice: 1000,
    status: "approved",
    auctionStatus: "upcoming",
    auctionOrder: 4,
  },
  {
    fullName: "SALMAN HASAN",
    playerId: "2206005",
    phone: "01700000005",
    email: "salman.hasan.icon@epl.local",
    session: "2022-2023",
    categories: ["ICON PLAYER"],
    playingRole: "Batsman",
    isIcon: true,
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488221/epl_gallery/j5e4kll9wneqyluo4w3y.jpg",
    tier: "ICON PLAYER",
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab"),
    basePrice: 1000,
    status: "approved",
    auctionStatus: "upcoming",
    auctionOrder: 5,
  },
];

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI not found in env");
  }
  await mongoose.connect(MONGODB_URI, { dbName: "epl_db" });
  console.log("Connected to MongoDB epl_db");

  const tier = await mongoose.connection.db.collection("auctiontiers").findOne({
    _id: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab")
  });
  console.log("Target Tier:", tier?.name, tier?.category, tier?.basePrice);

  for (const player of iconPlayersData) {
    const existing = await mongoose.connection.db.collection("players").findOne({
      fullName: { $regex: new RegExp(`^${player.fullName}$`, "i") }
    });

    if (existing) {
      console.log(`Updating existing player ${player.fullName}...`);
      await mongoose.connection.db.collection("players").updateOne(
        { _id: existing._id },
        {
          $set: {
            categories: player.categories,
            playingRole: player.playingRole,
            isIcon: true,
            photoUrl: player.photoUrl,
            tier: player.tier,
            auctionTier: player.auctionTier,
            basePrice: player.basePrice,
            status: "approved",
            auctionStatus: existing.auctionStatus || "upcoming",
            auctionOrder: player.auctionOrder,
            updatedAt: new Date(),
          }
        }
      );
    } else {
      console.log(`Inserting new player ${player.fullName}...`);
      await mongoose.connection.db.collection("players").insertOne({
        ...player,
        registrationNumber: null,
        paymentMethod: null,
        transactionId: null,
        cashReceivedBy: null,
        paymentNote: null,
        team: null,
        soldPrice: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Count players in ICON PLAYER tier
  const countInTier = await mongoose.connection.db.collection("players").countDocuments({
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab")
  });
  console.log(`\nSuccessfully seeded! Total players in ICON PLAYER tier: ${countInTier}`);

  const seeded = await mongoose.connection.db.collection("players").find({
    auctionTier: new mongoose.Types.ObjectId("6ae4ee90007ad4ff275cfbab")
  }).toArray();
  seeded.forEach((p, i) => {
    console.log(`${i + 1}. [${p.playerId}] ${p.fullName} | Role: ${p.playingRole} | Category: ${p.categories.join(", ")} | Tier: ${p.tier} | Base: ৳${p.basePrice}`);
  });

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

