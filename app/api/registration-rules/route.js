import connectToDatabase from "../../../lib/mongodb";
import RegistrationRule from "../../../models/registrationRule";
import { getSession } from "../../../lib/adminAuth";

export const runtime = "nodejs";

export const GET = async () => {
  await connectToDatabase();
  const rule = await RegistrationRule.findOne().lean();
  return Response.json({ rules: rule?.rules || [] });
};

export const PUT = async (request) => {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated." }, { status: 401 });
  const { rules } = await request.json();
  if (!Array.isArray(rules) || rules.some((rule) => typeof rule !== "string")) {
    return Response.json({ error: "Rules must be a list of text values." }, { status: 400 });
  }
  const cleaned = rules.map((rule) => rule.trim()).filter(Boolean);
  await connectToDatabase();
  const rule = await RegistrationRule.findOneAndUpdate({}, { rules: cleaned }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
  return Response.json({ rules: rule.rules });
};
