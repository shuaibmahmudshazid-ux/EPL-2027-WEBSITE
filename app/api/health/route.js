import connectToDatabase from "../../../lib/mongodb";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    await connectToDatabase();
    return Response.json({ status: "ok", database: "connected" });
  } catch {
    return Response.json({ status: "error", database: "unavailable" }, { status: 503 });
  }
};
