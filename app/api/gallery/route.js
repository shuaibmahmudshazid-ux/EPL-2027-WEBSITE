import connectToDatabase from "../../../lib/mongodb";
import { uploadImage } from "../../../lib/cloudinary";
import GalleryItem from "../../../models/galleryItem";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

// ============================================
// GET: Fetch all gallery images (Only returns what admin added)
// ============================================
export const GET = async () => {
  try {
    await connectToDatabase();
    const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
    return Response.json({ items: items || [] });
  } catch (error) {
    console.error("Gallery GET error:", error);
    return Response.json({ items: [] });
  }
};

// ============================================
// POST: Add new tournament / match image (Admin only)
// ============================================
export const POST = async (request) => {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return Response.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    await connectToDatabase();
    const contentType = request.headers.get("content-type") || "";

    let title = "";
    let imageUrl = "";
    let category = "Match Action";
    let date = "";
    let description = "";
    let featured = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") || "").toString().trim();
      category = (formData.get("category") || "Match Action").toString().trim();
      date = (formData.get("date") || "").toString().trim();
      description = (formData.get("description") || "").toString().trim();
      featured = formData.get("featured") === "true";

      const file = formData.get("image");
      const urlInput = (formData.get("imageUrl") || "").toString().trim();

      if (file && typeof file === "object" && file.size > 0) {
        try {
          const uploadResult = await uploadImage(file, "epl_gallery");
          imageUrl = uploadResult.secure_url || uploadResult.url;
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
          return Response.json({ error: "Image upload failed. Check Cloudinary configuration." }, { status: 500 });
        }
      } else if (urlInput) {
        imageUrl = urlInput;
      } else {
        return Response.json({ error: "Please upload an image file or provide a valid image URL." }, { status: 400 });
      }
    } else {
      const body = await request.json();
      title = (body.title || "").trim();
      imageUrl = (body.imageUrl || "").trim();
      category = (body.category || "Match Action").trim();
      date = (body.date || "").trim();
      description = (body.description || "").trim();
      featured = Boolean(body.featured);
    }

    if (!title || !imageUrl) {
      return Response.json({ error: "Title and Image are required." }, { status: 400 });
    }

    const newItem = await GalleryItem.create({
      title,
      imageUrl,
      category,
      date: date || new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      description,
      featured,
    });

    return Response.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Gallery POST error:", error);
    return Response.json({ error: error.message || "Failed to add gallery item." }, { status: 500 });
  }
};
