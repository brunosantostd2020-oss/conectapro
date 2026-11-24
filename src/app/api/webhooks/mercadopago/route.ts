import { db } from "@/lib/db";
import { MP } from "@/lib/plans";

// O corpo recebido não é confiável: usamos só o id e consultamos a API oficial.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.data?.id ?? new URL(req.url).searchParams.get("data.id") ?? "");
  if (!id || !process.env.MP_ACCESS_TOKEN) return new Response("ok");
  const r = await fetch(`${MP}/preapproval/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } });
  if (!r.ok) return new Response("ok");
  const s = await r.json();
  const [proId, plan] = String(s.external_reference ?? "").split(":");
  if (!proId || (plan !== "PRO" && plan !== "PREMIUM")) return new Response("ok");
  await db.subscription.upsert({ where: { mpId: id }, create: { proId, plan, mpId: id, status: s.status }, update: { status: s.status } });
  await db.professional.updateMany({ where: { id: proId }, data: { plan: s.status === "authorized" ? plan : "FREE" } });
  return new Response("ok");
}
