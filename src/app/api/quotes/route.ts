import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad, limited } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return bad("Entre na sua conta para pedir orçamento", 401);
  if (limited(req, "quote", 10, 600_000)) return bad("Muitas solicitações. Tente mais tarde.", 429);
  const p = z.object({ proId: z.string(), message: z.string().trim().min(10, "Descreva o serviço (mín. 10 caracteres)").max(1000),
    scheduledAt: z.string().optional().transform(v => (v ? new Date(v) : undefined)) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return bad(p.error.issues[0].message);
  const pro = await db.professional.findFirst({ where: { id: p.data.proId, approved: true } });
  if (!pro) return bad("Profissional não encontrado", 404);
  await db.quote.create({ data: { clientId: u.id, proId: pro.id, message: p.data.message, scheduledAt: p.data.scheduledAt } });
  return NextResponse.json({ ok: true, message: "Solicitação enviada! O profissional vai responder em breve." });
}
