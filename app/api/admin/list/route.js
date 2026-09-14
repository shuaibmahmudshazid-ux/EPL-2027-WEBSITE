import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const GET = async () => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  await connectToDatabase();
  const admins = await Admin.find().select("email role createdAt").sort({ createdAt: 1 }).lean();
  return Response.json({ admins });
};
