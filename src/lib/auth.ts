import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET ausente ou curto (mín. 32 caracteres)");
  return new TextEncoder().encode(s);
};
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("14d").sign(key());
  cookies().set("cp_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
}
export async function getUser() {
  const t = cookies().get("cp_session")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return await db.user.findUnique({ where: { id: String(payload.sub) }, include: { professional: true } });
  } catch { return null; }
}
export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

const hits = new Map<string, { n: number; t: number }>();
export function limited(req: Request, bucket: string, max = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const k = `${bucket}:${ip}`, now = Date.now(), h = hits.get(k);
  if (!h || now - h.t > windowMs) { hits.set(k, { n: 1, t: now }); return false; }
  return ++h.n > max;
}
