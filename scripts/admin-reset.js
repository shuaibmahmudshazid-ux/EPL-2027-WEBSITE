import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Load .env.local if not already in environment
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "epl_db";

if (!uri) {
  console.error("Error: MONGODB_URI is not set in environment or .env.local");
  process.exit(1);
}

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const role = process.argv[4]?.trim().toLowerCase() || "superadmin";

if (!email || !password) {
  console.log("Usage: node scripts/admin-reset.js <email> <new-password> [role]");
  console.log("Example: node scripts/admin-reset.js shuaibmahmudshazid@gmail.com MyNewPass123 superadmin");
  process.exit(1);
}

const run = async () => {
  try {
    console.log(`Connecting to MongoDB (${dbName})...`);
    const conn = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });

    const adminCollection = conn.connection.db.collection("admins");
    const passwordHash = await bcrypt.hash(password, 10);

    const existingAdmin = await adminCollection.findOne({ email });

    if (existingAdmin) {
      await adminCollection.updateOne(
        { email },
        {
          $set: {
            passwordHash,
            role,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Successfully updated existing admin: ${email} (role: ${role})`);
    } else {
      await adminCollection.insertOne({
        email,
        passwordHash,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Successfully created new admin: ${email} (role: ${role})`);
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("❌ Failed to reset/create admin:", error);
    process.exit(1);
  }
};

run();
