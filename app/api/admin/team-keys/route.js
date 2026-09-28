import connectToDatabase from "../../../../lib/mongodb";
import TeamKey from "../../../../models/teamKey";
import "../../../../models/team";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateKey = () => Array.from({ length: 10 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const GET = async () => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  await connectToDatabase();
  const teamKeys = await TeamKey.find().populate("team", "name").sort({ createdAt: -1 }).lean();
  return Response.json({ teamKeys });
};

export const POST = async () => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  await connectToDatabase();
  let key = null;
  for (let attempt = 0; attempt < 5 && !key; attempt++) {
    const candidate = generateKey();
    if (!(await TeamKey.findOne({ key: candidate }).lean())) key = candidate;
  }
  if (!key) return Response.json({ error: "Unable to generate a unique key. Try again." }, { status: 500 });
  const teamKey = await TeamKey.create({ key });
  return Response.json({ teamKey }, { status: 201 });
};
