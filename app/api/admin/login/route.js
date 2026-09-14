import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { verifyPassword, createSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });
  await connectToDatabase();
  const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await createSession(admin);
  return Response.json({ admin: { email: admin.email, role: admin.role } });
};
