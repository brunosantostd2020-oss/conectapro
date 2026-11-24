import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser, bad } from "@/lib/auth";

// LGPD: exclusão definitiva da conta e dos dados vinculados (cascata).
export async function DELETE() {
  const u = await getUser();
  if (!u) return bad("Não autenticado", 401);
  if (u.role === "ADMIN") return bad("Contas de administrador não podem ser excluídas por aqui", 403);
  await db.user.delete({ where: { id: u.id } });
  cookies().delete("cp_session");
  return NextResponse.json({ ok: true, redirect: "/" });
}
