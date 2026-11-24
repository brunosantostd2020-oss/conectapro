import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Form from "@/components/Form";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";
export default async function Admin() {
  const u = await getUser();
  if (u?.role !== "ADMIN") notFound();
  const [users, pending, subs, reports, logs] = await Promise.all([
    db.user.count(), db.professional.findMany({ where: { approved: false }, include: { user: true, category: true, city: true } }),
    db.professional.groupBy({ by: ["plan"], _count: true }), db.report.findMany({ include: { user: true, pro: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 })]);
  const mrr = subs.reduce((s, g) => s + (g.plan === "FREE" ? 0 : PLANS[g.plan].price * g._count), 0);
  return (
    <div className="space-y-8"><h1 className="text-2xl font-extrabold">Administração</h1>
      <p className="rounded-xl border border-line bg-card p-4">Usuários: <b>{users}</b> · Receita mensal recorrente estimada: <b>R$ {mrr.toFixed(2).replace(".", ",")}</b> · Assinantes: <b>{subs.filter(g => g.plan !== "FREE").reduce((a, g) => a + g._count, 0)}</b></p>
      <section><h2 className="mb-2 text-lg font-bold">Profissionais aguardando aprovação</h2>
        {pending.length === 0 ? <p className="text-mute">Nada pendente.</p> : <ul className="space-y-2">{pending.map(p => <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card p-3"><span><b>{p.user.name}</b> · {p.category.name} · {p.city.name} · {p.whatsapp}</span>
          <span className="flex gap-2"><Form action="/api/admin/approve" extra={{ proId: p.id }} submit="Aprovar" /></span></li>)}</ul>}</section>
      <section><h2 className="mb-2 text-lg font-bold">Denúncias recentes</h2>
        {reports.length === 0 ? <p className="text-mute">Sem denúncias.</p> : <ul className="space-y-2">{reports.map(r => <li key={r.id} className="rounded-xl border border-line bg-card p-3 text-sm"><b>{r.pro.user.name}</b> — {r.reason} <i>(por {r.user.name})</i></li>)}</ul>}</section>
      <section><h2 className="mb-2 text-lg font-bold">Registro de atividades</h2>
        <ul className="text-sm text-mute">{logs.map(l => <li key={l.id}>{l.createdAt.toLocaleString("pt-BR")} · {l.action} · {l.detail}</li>)}</ul></section>
    </div>);
}
