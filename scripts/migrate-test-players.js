import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const sourceDatabase = process.env.MIGRATION_SOURCE_DB || "test";
const targetDatabase = process.env.MIGRATION_TARGET_DB || "epl_db";

if (!uri) throw new Error("MONGODB_URI is not configured.");
if (sourceDatabase === targetDatabase) {
  throw new Error("Source and target databases must be different.");
}

const source = await mongoose.createConnection(uri, {
  dbName: sourceDatabase,
}).asPromise();
const target = await mongoose.createConnection(uri, {
  dbName: targetDatabase,
}).asPromise();

try {
  const players = await source.db.collection("players").find({}).toArray();
  const existingPlayerIds = new Set(
    (await target.db.collection("players").find({}, { projection: { playerId: 1 } }).toArray())
      .map((player) => player.playerId),
  );
  const playersToCopy = players.filter(
    (player) => !existingPlayerIds.has(player.playerId),
  );

  if (playersToCopy.length) {
    await target.db.collection("players").insertMany(playersToCopy, {
      ordered: true,
    });
  }

  console.log(
    JSON.stringify({
      sourceDatabase,
      targetDatabase,
      found: players.length,
      migrated: playersToCopy.length,
      skipped: players.length - playersToCopy.length,
      targetPlayerCount: await target.db.collection("players").countDocuments(),
    }),
  );
} finally {
  await Promise.all([source.close(), target.close()]);
}
