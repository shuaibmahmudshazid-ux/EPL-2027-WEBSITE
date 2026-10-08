import connectToDatabase from "../../../../lib/mongodb";
import Fixture from "../../../../models/fixture";
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
      return Response.json({ error: "Fixture ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    await Fixture.findByIdAndDelete(id);

    return Response.json({ success: true, message: "Fixture removed." });
  } catch (error) {
    console.error("Fixture DELETE error:", error);
    return Response.json({ error: error.message || "Failed to delete fixture." }, { status: 500 });
  }
};
