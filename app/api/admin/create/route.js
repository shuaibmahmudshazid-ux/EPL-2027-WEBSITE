import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { getSession, verifyPassword, hashPassword } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const { email, password, superAdminPassword } = await request.json();
  if (!email || !password || !superAdminPassword) return Response.json({ error: "Email, password, and super admin password are required." }, { status: 400 });
  if (password.length < 6) return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  await connectToDatabase();
  const superAdmin = await Admin.findOne({ role: "superadmin" });
  if (!superAdmin || !(await verifyPassword(superAdminPassword, superAdmin.passwordHash))) {
    return Response.json({ error: "Incorrect super admin password." }, { status: 401 });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await Admin.findOne({ email: normalizedEmail });
  if (existing) return Response.json({ error: "An admin with this email already exists." }, { status: 409 });
  const passwordHash = await hashPassword(password);
  const admin = await Admin.create({ email: normalizedEmail, passwordHash, role: "admin" });
  return Response.json({ admin: { email: admin.email, role: admin.role } }, { status: 201 });
};
