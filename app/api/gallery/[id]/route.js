import connectToDatabase from "../../../../lib/mongodb";
import GalleryItem from "../../../../models/galleryItem";
import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const DELETE = async (request, { params }) => {
  try {
    const adminSession = await getSession();
    if (!adminSession) {
      return Response.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return Response.json({ error: "Item ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    await GalleryItem.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Gallery item removed." });
  } catch (error) {
    console.error("Gallery DELETE error:", error);
    return Response.json({ error: error.message || "Failed to delete gallery item." }, { status: 500 });
  }
};
