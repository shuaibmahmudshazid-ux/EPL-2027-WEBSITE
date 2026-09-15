import connectToDatabase from "../../../lib/mongodb";
import { uploadImage } from "../../../lib/cloudinary";
import { sendRegistrationEmail } from "../../../lib/mailer";
import Player from "../../../models/player";
import "../../../models/team";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

export const GET = async () => {
  const adminSession = await getSession();
  if (!adminSession) return Response.json({ error: "Not authenticated." }, { status: 401 });
  await connectToDatabase();
  const players = await Player.find().populate("team", "name").sort({ createdAt: -1 }).lean();
  return Response.json({ players });
};

export const POST = async (request) => {
  try {
    const formData = await request.formData();
    const fullName = formData.get("fullName")?.trim(); const phone = formData.get("phone")?.trim(); const playerId = formData.get("playerId")?.trim(); const registrationNumber = formData.get("registrationNumber")?.trim(); const email = formData.get("email")?.trim().toLowerCase(); const session = formData.get("session"); const categories = formData.getAll("categories[]"); const photo = formData.get("photo");
    if (!fullName || !phone || !playerId || !registrationNumber || !session || !categories.length || !(photo instanceof File)) return Response.json({ error: "Complete all required fields and upload a photo." }, { status: 400 });
    if (!/^\d{11}$/.test(phone)) return Response.json({ error: "Phone number must contain exactly 11 digits." }, { status: 400 });
    if (!/^\d{7}$/.test(playerId)) return Response.json({ error: "Student ID must be exactly 7 digits." }, { status: 400 });
    if (!/^\d{5}$/.test(registrationNumber)) return Response.json({ error: "Registration number must be exactly 5 digits." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!["image/jpeg", "image/png"].includes(photo.type)) return Response.json({ error: "Photo must be a JPG or PNG file." }, { status: 400 });
    await connectToDatabase();
    const existing = await Player.findOne({ $or: [{ playerId }, ...(email ? [{ email }] : [])] }).lean();
    if (existing) return Response.json({ error: existing.playerId === playerId ? "This Student ID is already registered." : "This email is already registered." }, { status: 409 });
    const uploaded = await uploadImage(photo, "epl/player-photos"); const player = await Player.create({ fullName, phone, playerId, registrationNumber, email: email || undefined, session, categories, photoUrl: uploaded.secure_url });
    if (email && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) { try { await sendRegistrationEmail({ to: email, name: fullName, registrationType: "Player", reference: player.playerId }); } catch (error) { console.error("Registration email failed", error); } }
    return Response.json({ player }, { status: 201 });
  } catch (error) {
  console.error("PLAYER REGISTRATION ERROR:", error);

  return Response.json(
    {
      error: "Unable to create player registration.",
      debug: error?.message || "Unknown server error",
      code: error?.code || null,
    },
    { status: 500 }
  );
}
};
