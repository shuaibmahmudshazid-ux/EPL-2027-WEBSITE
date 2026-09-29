import connectToDatabase from "../../../../lib/mongodb";
import Admin from "../../../../models/admin";
import { verifyPassword, createSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async (request) => {
  try {
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
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    let errorMessage = "Unable to connect to database or authenticate.";
    if (error?.message?.includes("ADMIN_SESSION_SECRET")) {
      errorMessage = "Server configuration error: ADMIN_SESSION_SECRET is missing in environment variables.";
    } else if (error?.name === "MongooseServerSelectionError" || error?.message?.includes("buffering timed out") || error?.message?.includes("ETIMEDOUT")) {
      errorMessage = "Database connection timed out. Please make sure MongoDB Atlas Network Access whitelist allows connections from Vercel (0.0.0.0/0).";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
};