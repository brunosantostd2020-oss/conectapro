import { NextResponse } from "next/server";
import { getUser, bad } from "@/lib/auth";
import { PLANS, MP } from "@/lib/plans";

// Cria assinatura recorrente (preapproval) no Mercado Pago e devolve o link de checkout.
export async function POST(req: Request) {
  const u = await getUser();
  if (!u?.professional) return bad("Apenas profissionais podem assinar", 403);
  const { plan } = await req.json().catch(() => ({}));
  if (plan !== "PRO" && plan !== "PREMIUM") return bad("Plano inválido");
  if (!process.env.MP_ACCESS_TOKEN) return bad("Pagamentos ainda não configurados (MP_ACCESS_TOKEN)", 503);
  const r = await fetch(`${MP}/preapproval`, { method: "POST",
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason: `ConectaPro ${PLANS[plan as "PRO"].name}`, payer_email: u.email,
      external_reference: `${u.professional.id}:${plan}`, status: "pending",
      back_url: `${process.env.APP_URL ?? ""}/painel`,
      auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: PLANS[plan as "PRO"].price, currency_id: "BRL" } }) });
  const d = await r.json();
  if (!r.ok || !d.init_point) return bad("Não foi possível iniciar o pagamento", 502);
  return NextResponse.json({ ok: true, redirect: d.init_point });
}
