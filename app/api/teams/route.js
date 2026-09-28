import connectToDatabase from "../../../lib/mongodb";
import { uploadImage } from "../../../lib/cloudinary";
import Team from "../../../models/team";
import TeamKey from "../../../models/teamKey";
import "../../../models/player";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

export const GET = async () => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  await connectToDatabase();
  const teams = await Team.find().populate("players", "fullName playerId").sort({ createdAt: -1 }).lean();
  return Response.json({ teams });
};

export const POST = async (request) => {
  let claimedKey = null;
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.trim();
    const uniqueKey = formData.get("uniqueKey")?.trim();
    const logo = formData.get("logo");
    let managers;
    try { managers = JSON.parse(formData.get("managers") || "[]"); } catch { managers = null; }
    if (!name || !uniqueKey || !Array.isArray(managers) || !managers.length || managers.some(manager => !manager.name || !manager.phone || !manager.email)) {
      return Response.json({ error: "Team name, unique key, and at least one complete manager are required." }, { status: 400 });
    }
    const hasLogo = logo instanceof File && logo.size > 0;
    if (!hasLogo) return Response.json({ error: "Upload your team logo." }, { status: 400 });
    if (!["image/jpeg", "image/png"].includes(logo.type) || logo.size > 2 * 1024 * 1024) {
      return Response.json({ error: "Logo must be a JPG or PNG file smaller than 2MB." }, { status: 400 });
    }
    await connectToDatabase();
    const normalizedKey = uniqueKey.trim().toUpperCase();
    claimedKey = await TeamKey.findOneAndUpdate({ key: normalizedKey, status: "free" }, { status: "used" }, { returnDocument: "after" });
    if (!claimedKey) {
      const existingKey = await TeamKey.findOne({ key: normalizedKey }).lean();
      return Response.json({ error: existingKey ? "This unique key has already been used." : "Invalid unique key." }, { status: existingKey ? 409 : 400 });
    }
    const logoUrl = (await uploadImage(logo, "epl/team-logos")).secure_url;
    const team = await Team.create({ name, uniqueKey: normalizedKey, managers, logoUrl });
    claimedKey.team = team._id;
    await claimedKey.save();
    return Response.json({ team }, { status: 201 });
  } catch (error) {
    if (claimedKey) { claimedKey.status = "free"; claimedKey.team = null; await claimedKey.save(); }
    const status = error?.code === 11000 ? 409 : 500;
    return Response.json({ error: status === 409 ? "Team name already exists." : "Unable to create team." }, { status });
  }
};
