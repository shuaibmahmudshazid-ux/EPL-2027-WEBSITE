import connectToDatabase from "../../../../../lib/mongodb";
import Team from "../../../../../models/team";
import AuctionState from "../../../../../models/auctionState";
import { uploadImage, uploadBase64 } from "../../../../../lib/cloudinary";
import { getSession } from "../../../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// POST: Upload & update team logo
// Accepts multipart/form-data with "logo" or "file"
// Or JSON with "logoUrl" or "logoBase64"
// ============================================
export const POST = async (request, { params }) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;

  const team = await Team.findById(id);
  if (!team) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let newLogoUrl = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const logoFile = formData.get("logo") || formData.get("file");

      if (!logoFile || !(logoFile instanceof Blob) || logoFile.size === 0) {
        return Response.json({ error: "Please provide a valid image file." }, { status: 400 });
      }

      if (logoFile.size > 2 * 1024 * 1024) {
        return Response.json({ error: "Logo image must be 2 MB or less." }, { status: 400 });
      }

      const uploadResult = await uploadImage(logoFile, "epl/team-logos");
      newLogoUrl = uploadResult.secure_url;
    } else {
      const body = await request.json();
      if (body.logoUrl) {
        newLogoUrl = body.logoUrl;
      } else if (body.logoBase64 && typeof body.logoBase64 === "string") {
        const uploadResult = await uploadBase64(body.logoBase64, "epl/team-logos");
        newLogoUrl = uploadResult.secure_url;
      } else {
        return Response.json({ error: "No logo data provided." }, { status: 400 });
      }
    }

    team.logoUrl = newLogoUrl;
    await team.save();

    // Sync to live auction state if this team is the active leading bidder
    await AuctionState.updateMany(
      { currentBidderTeam: team._id },
      { $set: { currentBidderTeamLogo: newLogoUrl } }
    );

    const updatedTeam = await Team.findById(team._id)
      .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
      .lean();

    return Response.json({
      message: "Team logo updated successfully.",
      logoUrl: newLogoUrl,
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Team logo upload failed:", error);
    return Response.json(
      { error: error.message || "Failed to upload team logo." },
      { status: 500 }
    );
  }
};

// ============================================
// DELETE: Remove team logo
// ============================================
export const DELETE = async (_request, { params }) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Not authenticated as admin." }, { status: 401 });
  }

  await connectToDatabase();
  const { id } = await params;

  const team = await Team.findById(id);
  if (!team) {
    return Response.json({ error: "Team not found." }, { status: 404 });
  }

  team.logoUrl = null;
  await team.save();

  // Sync to live auction state
  await AuctionState.updateMany(
    { currentBidderTeam: team._id },
    { $set: { currentBidderTeamLogo: null } }
  );

  const updatedTeam = await Team.findById(team._id)
    .populate("players", "fullName playerId categories soldPrice basePrice photoUrl session auctionStatus tier registrationNumber")
    .lean();

  return Response.json({
    message: "Team logo removed successfully.",
    team: updatedTeam,
  });
};

