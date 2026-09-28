import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { verifyPassword, createSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const normalizedEmail = email.trim().toLowerCase();

  const admin = await Admin.findOne({
    email: normalizedEmail,
  });

  console.log("ADMIN LOGIN - email found:", !!admin);

  if (!admin) {
    return Response.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const passwordValid = await verifyPassword(
    password,
    admin.passwordHash
  );

  console.log("ADMIN LOGIN - password valid:", passwordValid);

  if (!passwordValid) {
    return Response.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await createSession(admin);

  return Response.json({
    admin: {
      email: admin.email,
      role: admin.role,
    },
  });
};