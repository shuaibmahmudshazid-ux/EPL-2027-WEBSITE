import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const globalCache = globalThis;

globalCache.mongoose ??= { connection: null, promise: null };

const connectToDatabase = async () => {
  if (globalCache.mongoose.connection) return globalCache.mongoose.connection;

  globalCache.mongoose.promise ??= mongoose.connect(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    globalCache.mongoose.connection = await globalCache.mongoose.promise;
  } catch (error) {
    globalCache.mongoose.promise = null;
    throw error;
  }

  return globalCache.mongoose.connection;
};

export default connectToDatabase;
