import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, limited } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return bad("Entre para denunciar", 401);
  if (limited(req, "report", 5, 600_000)) return bad("Muitas denúncias. Tente mais tarde.", 429);
  const p = z.object({ proId: z.string(), reason: z.string().trim().min(10, "Explique o motivo (mín. 10 caracteres)").max(800) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return bad(p.error.issues[0].message);
  await db.report.create({ data: { userId: u.id, ...p.data } });
  return NextResponse.json({ ok: true, message: "Denúncia recebida. Nossa equipe vai analisar." });
}
