import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, bad, limited } from "@/lib/auth";

export async function POST(req: Request) {
  if (limited(req, "login", 8)) return bad("Muitas tentativas. Aguarde um minuto.", 429);
  const p = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return bad("Informe e-mail e senha");
  const u = await db.user.findUnique({ where: { email: p.data.email } });
  if (!u || !(await bcrypt.compare(p.data.password, u.passwordHash))) return bad("E-mail ou senha incorretos", 401);
  await createSession(u.id);
  return NextResponse.json({ ok: true, redirect: u.role === "ADMIN" ? "/admin" : u.role === "PRO" ? "/painel" : "/" });
}
