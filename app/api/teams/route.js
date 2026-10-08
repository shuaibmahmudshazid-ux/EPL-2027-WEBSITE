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

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generateKey = () =>
  Array.from({ length: 10 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

export const POST = async (request) => {
  const session = await getSession();
  const isAdmin = Boolean(session);

  let claimedKey = null;
  try {
    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let uniqueKey = "";
    let logo = null;
    let managers = [];
    let customLogoUrl = null;

    if (contentType.includes("application/json")) {
      if (!isAdmin) {
        return Response.json({ error: "Only admins can create teams via JSON." }, { status: 403 });
      }
      const json = await request.json();
      name = json.name?.trim();
      uniqueKey = json.uniqueKey?.trim();
      managers = Array.isArray(json.managers) ? json.managers : [];
      customLogoUrl = json.logoUrl || null;
    } else {
      const formData = await request.formData();
      name = formData.get("name")?.trim();
      uniqueKey = formData.get("uniqueKey")?.trim();
      logo = formData.get("logo");
      customLogoUrl = formData.get("logoUrl")?.trim() || null;
      try {
        managers = JSON.parse(formData.get("managers") || "[]");
      } catch {
        managers = null;
      }
    }

    const cleanManagers = Array.isArray(managers)
      ? managers.filter((m) => m && (m.name?.trim() || m.phone?.trim() || m.email?.trim()))
      : [];

    if (!name) {
      return Response.json(
        { error: "Team name is required." },
        { status: 400 }
      );
    }

    for (const m of cleanManagers) {
      if (!m.name?.trim() || !m.phone?.trim() || !m.email?.trim()) {
        return Response.json(
          { error: "If providing a manager, please fill in their name, phone, and email completely." },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Check duplicate team name safely
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingName = await Team.findOne({ name: new RegExp(`^${escapedName}$`, "i") }).lean();
    if (existingName) {
      return Response.json({ error: `Team name "${name}" already exists.` }, { status: 409 });
    }

    let normalizedKey = uniqueKey ? uniqueKey.trim().toUpperCase() : "";

    // If admin and key is empty, auto-generate key
    if (isAdmin && !normalizedKey) {
      for (let i = 0; i < 5; i++) {
        const candidate = generateKey();
        if (!(await TeamKey.findOne({ key: candidate }).lean())) {
          normalizedKey = candidate;
          break;
        }
      }
    }

    if (!normalizedKey) {
      return Response.json({ error: "Unique key is required." }, { status: 400 });
    }

    // Handle key claiming or admin auto-creation
    claimedKey = await TeamKey.findOneAndUpdate(
      { key: normalizedKey, status: "free" },
      { status: "used" },
      { new: true }
    );

    if (!claimedKey) {
      const existingKey = await TeamKey.findOne({ key: normalizedKey });
      if (isAdmin) {
        // Admin can claim or re-register an existing free key, or create new key
        if (!existingKey) {
          claimedKey = await TeamKey.create({ key: normalizedKey, status: "used" });
        } else if (existingKey.status === "used" && existingKey.team) {
          return Response.json({ error: "This unique key is already in use by another team." }, { status: 409 });
        } else {
          existingKey.status = "used";
          claimedKey = await existingKey.save();
        }
      } else {
        return Response.json(
          { error: existingKey ? "This unique key has already been used." : "Invalid unique key." },
          { status: existingKey ? 409 : 400 }
        );
      }
    }

    // Handle logo upload
    let logoUrl = customLogoUrl;
    const hasLogo = logo instanceof File && logo.size > 0;
    if (hasLogo) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const isAllowedType =
        validTypes.includes(logo.type?.toLowerCase()) ||
        /\.(jpe?g|png|webp)$/i.test(logo.name || "");

      if (!isAllowedType || logo.size > 2 * 1024 * 1024) {
        if (claimedKey) {
          claimedKey.status = "free";
          await claimedKey.save();
        }
        return Response.json({ error: "Logo must be a JPG, PNG, or WEBP file smaller than 2MB." }, { status: 400 });
      }
      logoUrl = (await uploadImage(logo, "epl/team-logos")).secure_url;
    } else if (!logoUrl && !isAdmin) {
      if (claimedKey) {
        claimedKey.status = "free";
        await claimedKey.save();
      }
      return Response.json({ error: "Upload your team logo." }, { status: 400 });
    }

    const team = await Team.create({
      name,
      uniqueKey: normalizedKey,
      managers: cleanManagers,
      logoUrl: logoUrl || null,
      status: "active",
      points: 50000,
    });

    if (claimedKey) {
      claimedKey.team = team._id;
      claimedKey.status = "used";
      await claimedKey.save();
    }

    return Response.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Team creation failed:", error);
    if (claimedKey && !claimedKey.team) {
      claimedKey.status = "free";
      try {
        await claimedKey.save();
      } catch (keyErr) {
        console.error("Failed to release key status:", keyErr);
      }
    }
    const status = error?.code === 11000 ? 409 : (error?.name === "ValidationError" ? 400 : 500);
    return Response.json(
      {
        error:
          error?.code === 11000
            ? "Team name or key already exists."
            : error?.message || "Unable to create team.",
      },
      { status }
    );
  }
};
