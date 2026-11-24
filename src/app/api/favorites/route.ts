import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (!u) return bad("Entre para salvar favoritos", 401);
  const { proId } = await req.json().catch(() => ({}));
  if (typeof proId !== "string") return bad("Dados inválidos");
  const where = { userId_proId: { userId: u.id, proId } };
  if (await db.favorite.findUnique({ where })) { await db.favorite.delete({ where }); return NextResponse.json({ ok: true, message: "Removido dos favoritos" }); }
  await db.favorite.create({ data: { userId: u.id, proId } });
  return NextResponse.json({ ok: true, message: "Salvo nos favoritos" });
}
