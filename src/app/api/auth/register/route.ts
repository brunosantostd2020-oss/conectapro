import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, bad, limited } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres").max(100),
  role: z.enum(["CLIENT", "PRO"]),
  consent: z.literal("sim", { errorMap: () => ({ message: "É preciso aceitar os Termos e a Política de Privacidade" }) }),
  categoryId: z.string().optional(), cityId: z.string().optional(),
  whatsapp: z.string().regex(/^\d{10,13}$/, "WhatsApp só com números e DDD").optional(),
  neighborhood: z.string().max(80).optional(), bio: z.string().max(600).optional(),
});
export async function POST(req: Request) {
  if (limited(req, "register", 5)) return bad("Muitas tentativas. Aguarde um minuto.", 429);
  const p = schema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return bad(p.error.issues[0].message);
  const d = p.data;
  if (d.role === "PRO" && !(d.categoryId && d.cityId && d.whatsapp)) return bad("Profissionais precisam informar categoria, cidade e WhatsApp");
  if (await db.user.findUnique({ where: { email: d.email } })) return bad("Este e-mail já está cadastrado", 409);
  const isAdmin = !!process.env.ADMIN_EMAIL && d.email === process.env.ADMIN_EMAIL.toLowerCase();
  const user = await db.user.create({ data: {
    name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 12),
    role: isAdmin ? "ADMIN" : d.role,
    ...(d.role === "PRO" && !isAdmin ? { professional: { create: {
      categoryId: d.categoryId!, cityId: d.cityId!, whatsapp: d.whatsapp!, neighborhood: d.neighborhood ?? "", bio: d.bio ?? "" } } } : {}),
  } });
  await createSession(user.id);
  return NextResponse.json({ ok: true, redirect: isAdmin ? "/admin" : d.role === "PRO" ? "/painel" : "/" });
}
