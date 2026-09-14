import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { getSession, verifyPassword, hashPassword } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) return Response.json({ error: "Current and new password are required." }, { status: 400 });
  if (newPassword.length < 6) return Response.json({ error: "New password must be at least 6 characters." }, { status: 400 });
  await connectToDatabase();
  const admin = await Admin.findById(session.id);
  if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
    return Response.json({ error: "Current password is incorrect." }, { status: 401 });
  }
  admin.passwordHash = await hashPassword(newPassword);
  await admin.save();
  return Response.json({ ok: true });
};
