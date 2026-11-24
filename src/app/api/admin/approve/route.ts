import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad } from "@/lib/auth";

export async function POST(req: Request) {
  const u = await getUser();
  if (u?.role !== "ADMIN") return bad("Acesso negado", 403);
  const { proId, approved } = await req.json().catch(() => ({}));
  if (typeof proId !== "string") return bad("Dados inválidos");
  await db.professional.update({ where: { id: proId }, data: { approved: approved !== false } });
  await db.auditLog.create({ data: { actorId: u.id, action: approved !== false ? "APPROVE_PRO" : "REJECT_PRO", detail: proId } });
  return NextResponse.json({ ok: true, message: "Atualizado", redirect: "/admin" });
}
