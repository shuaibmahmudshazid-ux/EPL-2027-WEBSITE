import connectToDatabase from "../../../../../lib/mongodb";
import Player from "../../../../../models/player";
import { uploadImage, uploadBase64 } from "../../../../../lib/cloudinary";
import { getSession } from "../../../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// POST: Upload & update player photo
// Accepts multipart/form-data with "photo"
// Or JSON with "photoUrl" or "photoBase64"
// ============================================
export const POST = async (request, { params }) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;

  const player = await Player.findById(id);
  if (!player) {
    return Response.json({ error: "Player not found." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let newPhotoUrl = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const photoFile = formData.get("photo");

      if (!photoFile || !(photoFile instanceof Blob) || photoFile.size === 0) {
        return Response.json({ error: "Please provide a valid image file." }, { status: 400 });
      }

      const uploadResult = await uploadImage(photoFile, "epl/player-photos");
      newPhotoUrl = uploadResult.secure_url;
    } else {
      const body = await request.json();
      if (body.photoUrl) {
        newPhotoUrl = body.photoUrl;
      } else if (body.photoBase64 && typeof body.photoBase64 === "string") {
        const uploadResult = await uploadBase64(body.photoBase64, "epl/player-photos");
        newPhotoUrl = uploadResult.secure_url;
      } else {
        return Response.json({ error: "No photo data provided." }, { status: 400 });
      }
    }

    if (!newPhotoUrl) {
      return Response.json({ error: "Failed to upload photo." }, { status: 500 });
    }

    player.photoUrl = newPhotoUrl;
    player.updatedAt = new Date();
    await player.save();

    return Response.json({
      success: true,
      message: "Player photo updated successfully.",
      photoUrl: newPhotoUrl,
      player,
    });
  } catch (error) {
    console.error("Error updating player photo:", error);
    return Response.json(
      { error: error.message || "Failed to upload and update player photo." },
      { status: 500 }
    );
  }
};

