import connectToDatabase from "../../../lib/mongodb";
import { uploadImage } from "../../../lib/cloudinary";
import { sendRegistrationEmail } from "../../../lib/mailer";
import Player from "../../../models/player";
import Team from "../../../models/team";
import AuctionTier from "../../../models/auctionTier";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

// =========================
// GET - Get all players
// =========================
export const GET = async () => {
  const adminSession = await getSession();

  await connectToDatabase();

  if (!adminSession) {
    // Public visitor: return players with showcase fields only (excluding sensitive contact/payment info)
    const players = await Player.find({ status: { $ne: "rejected" } })
      .select("fullName categories session photoUrl tier auctionTier status")
      .populate("auctionTier", "name category")
      .collation({ locale: "en", strength: 2 })
      .sort({ session: 1, fullName: 1 })
      .lean();

    return Response.json({ players });
  }

  const players = await Player.find()
    .populate("team", "name")
    .populate("auctionTier", "name category basePrice")
    .sort({ createdAt: -1 })
    .lean();

  return Response.json({ players });
};


// =========================
// POST - Register new player
// =========================
export const POST = async (request) => {
  try {
    const adminSession = await getSession();
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      if (!adminSession) {
        return Response.json({ error: "Only admins can register players via JSON." }, { status: 403 });
      }
      const json = await request.json();
      const {
        fullName,
        phone,
        playerId,
        registrationNumber,
        email,
        session,
        categories,
        photoUrl,
        teamId,
        tierId,
        basePrice,
        soldPrice,
      } = json;

      if (!fullName || !phone || !playerId || !session || !categories?.length) {
        return Response.json(
          { error: "Full name, phone, student ID, session, and categories are required." },
          { status: 400 }
        );
      }

      await connectToDatabase();

      const existing = await Player.findOne({ playerId: playerId.trim() }).lean();
      if (existing) {
        return Response.json({ error: "This Student ID is already registered." }, { status: 409 });
      }

      const player = await Player.create({
        fullName: fullName.trim(),
        phone: phone.trim(),
        playerId: playerId.trim(),
        registrationNumber: registrationNumber ? registrationNumber.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        session,
        categories,
        photoUrl: photoUrl || null,
        status: "approved",
        basePrice: Number(basePrice) || 0,
        auctionStatus: teamId ? "sold" : "upcoming",
      });

      if (tierId) {
        const tier = await AuctionTier.findById(tierId).lean();
        if (tier) {
          player.auctionTier = tier._id;
          player.tier = tier.name;
          player.basePrice = tier.basePrice;
        }
      }

      if (teamId) {
        const targetTeam = await Team.findById(teamId);
        if (targetTeam) {
          player.team = targetTeam._id;
          player.soldPrice = soldPrice !== undefined ? Number(soldPrice) : (player.basePrice || 0);
          player.auctionStatus = "sold";
          await Team.findByIdAndUpdate(targetTeam._id, { $addToSet: { players: player._id } });
        }
      }

      await player.save();
      const populatedPlayer = await Player.findById(player._id)
        .populate("team", "name logoUrl")
        .populate("auctionTier", "name category basePrice")
        .lean();

      return Response.json({ player: populatedPlayer }, { status: 201 });
    }

    const formData = await request.formData();

    const fullName = formData.get("fullName")?.trim();
    const phone = formData.get("phone")?.trim();
    const playerId = formData.get("playerId")?.trim();
    const registrationNumber =
      formData.get("registrationNumber")?.trim();
    const email = formData.get("email")?.trim().toLowerCase();
    const session = formData.get("session");
    const categories = formData.getAll("categories[]");
    const photo = formData.get("photo");

    // Required fields check
    if (
      !fullName ||
      !phone ||
      !playerId ||
      !registrationNumber ||
      !session ||
      !categories.length ||
      !(photo instanceof File)
    ) {
      return Response.json(
        {
          error:
            "Complete all required fields and upload a photo.",
        },
        { status: 400 }
      );
    }

    // Phone validation
    if (!/^\d{11}$/.test(phone)) {
      return Response.json(
        {
          error:
            "Phone number must contain exactly 11 digits.",
        },
        { status: 400 }
      );
    }

    // Student ID validation
    if (!/^\d{7}$/.test(playerId)) {
      return Response.json(
        {
          error:
            "Student ID must be exactly 7 digits.",
        },
        { status: 400 }
      );
    }

    // Registration number validation
    if (!/^\d{5}$/.test(registrationNumber)) {
      return Response.json(
        {
          error:
            "Registration number must be exactly 5 digits.",
        },
        { status: 400 }
      );
    }

    // Email validation
    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return Response.json(
        {
          error: "Enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Photo validation
    if (
      !["image/jpeg", "image/png"].includes(photo.type)
    ) {
      return Response.json(
        {
          error: "Photo must be a JPG or PNG file.",
        },
        { status: 400 }
      );
    }

    if (photo.size > 2 * 1024 * 1024) {
      return Response.json(
        {
          error: "Player photo must be 2 MB or less.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check duplicate Student ID / Email
    const existing = await Player.findOne({
      $or: [
        { playerId },
        ...(email ? [{ email }] : []),
      ],
    }).lean();

    if (existing) {
      return Response.json(
        {
          error:
            existing.playerId === playerId
              ? "This Student ID is already registered."
              : "This email is already registered.",
        },
        { status: 409 }
      );
    }

    // Upload photo to Cloudinary
    const uploaded = await uploadImage(
      photo,
      "epl/player-photos"
    );

    // Create player
    const player = await Player.create({
      fullName,
      phone,
      playerId,
      registrationNumber,
      email: email || undefined,
      session,
      categories,
      photoUrl: uploaded.secure_url,
    });

    // Send registration email
    if (
      email &&
      process.env.GMAIL_USER &&
      process.env.GMAIL_APP_PASSWORD
    ) {
      try {
        await sendRegistrationEmail({
          to: email,
          name: fullName,
          registrationType: "Player",
          reference: player.playerId,
        });
      } catch (error) {
        console.error(
          "Registration email failed",
          error
        );
      }
    }

    // Optional team assignment on registration
    const targetTeamId = formData.get("teamId") || formData.get("team");
    if (targetTeamId) {
      const targetTeam = await Team.findById(targetTeamId);
      if (targetTeam) {
        player.team = targetTeam._id;
        player.status = "approved";
        const customPrice = Number(formData.get("soldPrice")) || player.basePrice || 0;
        player.soldPrice = customPrice;
        player.auctionStatus = "sold";
        await player.save();
        await Team.findByIdAndUpdate(targetTeam._id, { $addToSet: { players: player._id } });
      }
    }

    return Response.json(
      { player },
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "PLAYER REGISTRATION ERROR:",
      error
    );

    return Response.json(
      {
        error: "Unable to create player registration.",
        debug:
          error?.message ||
          "Unknown server error",
        code: error?.code || null,
      },
      { status: 500 }
    );
  }
};


// =========================
// DELETE - Delete player
// =========================
export const DELETE = async (request) => {
  try {
    // Check admin login
    const adminSession = await getSession();

    if (!adminSession) {
      return Response.json(
        {
          error: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    // Get player ID from request
    const { playerId } = await request.json();

    if (!playerId) {
      return Response.json(
        {
          error: "Player ID is required.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find player
    const player = await Player.findOne({
      playerId,
    });

    if (!player) {
      return Response.json(
        {
          error: "Player not found.",
        },
        { status: 404 }
      );
    }

    // Delete player from MongoDB
    await Player.deleteOne({
      playerId,
    });

    return Response.json(
      {
        success: true,
        message: "Player deleted successfully.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "PLAYER DELETE ERROR:",
      error
    );

    return Response.json(
      {
        error: "Unable to delete player.",
        debug:
          error?.message ||
          "Unknown server error",
      },
      { status: 500 }
    );
  }
};