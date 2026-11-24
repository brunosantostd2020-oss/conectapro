import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return bad("Entre para avaliar", 401);
  const p = z.object({ proId: z.string(), rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().min(5, "Escreva ao menos 5 caracteres").max(800) })
    .safeParse(await req.json().catch(() => ({})));
  if (!p.success) return bad(p.error.issues[0].message);
  const own = await db.professional.findUnique({ where: { userId: u.id } });
  if (own?.id === p.data.proId) return bad("Você não pode avaliar o próprio perfil");
  const { proId, rating, comment } = p.data;
  await db.review.upsert({ where: { userId_proId: { userId: u.id, proId } }, create: { userId: u.id, proId, rating, comment }, update: { rating, comment, hidden: false } });
  return NextResponse.json({ ok: true, message: "Avaliação publicada" });
}
