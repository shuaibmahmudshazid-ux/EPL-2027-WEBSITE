import { clearSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";

export const POST = async () => {
  await clearSession();
  return Response.json({ ok: true });
};
