import { getSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const GET = async () => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  return Response.json({ admin: { email: session.email, role: session.role } });
};
