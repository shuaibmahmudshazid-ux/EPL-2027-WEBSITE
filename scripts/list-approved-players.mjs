import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "epl_db" });
  const sample = await mongoose.connection.db.collection("players").findOne({});
  console.log("Sample player fields:", Object.keys(sample || {}));
  console.log("Sample player:", sample);

  const total = await mongoose.connection.db.collection("players").countDocuments();
  console.log("Total players:", total);

  await mongoose.disconnect();
}

run().catch(console.error);
