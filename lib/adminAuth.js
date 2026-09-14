import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "epl_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const getSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return secret;
};

const hashPassword = (password) => bcrypt.hash(password, 10);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

const createSession = async (admin) => {
  const token = jwt.sign({ id: admin._id.toString(), email: admin.email, role: admin.role }, getSecret(), { expiresIn: SESSION_DURATION_SECONDS });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
};

const clearSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
};

const getSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
};

export { hashPassword, verifyPassword, createSession, clearSession, getSession };
