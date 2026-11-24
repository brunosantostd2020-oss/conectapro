import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Form from "@/components/Form";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
export default async function Panel() {
  const u = await getUser();
  if (!u) redirect("/login");
  const pro = u.professional;
  const [received, sent, favs] = await Promise.all([
    pro ? db.quote.findMany({ where: { proId: pro.id }, include: { client: true }, orderBy: { createdAt: "desc" }, take: 30 }) : [],
    db.quote.findMany({ where: { clientId: u.id }, include: { pro: { include: { user: true } } }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.favorite.findMany({ where: { userId: u.id }, include: { pro: { include: { user: true } } } })]);
  const stats = pro && pro.plan !== "FREE";
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Olá, {u.name.split(" ")[0]}</h1>
      {pro && (<section className="space-y-3">
        <p className="rounded-xl border border-line bg-card p-4">{pro.approved ? "Seu perfil está no ar." : "Seu perfil está em análise. Ele aparece nas buscas depois da aprovação."} Plano atual: <b>{pro.plan === "FREE" ? "Gratuito" : PLANS[pro.plan].name}</b>.</p>
        {stats ? <p className="rounded-xl border border-line bg-card p-4">Visualizações do perfil: <b>{pro.views}</b> · Pedidos recebidos: <b>{received.length}</b></p>
          : <p className="text-sm text-mute">Assine o Profissional para ver estatísticas, agenda e ganhar destaque.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {(["PRO", "PREMIUM"] as const).map(k => (<div key={k} className="rounded-xl border border-line bg-card p-4"><p className="font-bold">{PLANS[k].name} · R$ {PLANS[k].price.toFixed(2).replace(".", ",")}/mês</p>
            <p className="mb-3 text-sm text-mute">{k === "PRO" ? "Destaque nas buscas, estatísticas e agenda digital." : "Tudo do Profissional + destaque na página inicial e relatórios."}</p>
            <Form action="/api/billing/subscribe" extra={{ plan: k }} submit={`Assinar ${PLANS[k].name}`} /></div>))}
        </div>
        <h2 className="text-lg font-bold">Pedidos e agenda</h2>
        {received.length === 0 ? <p className="text-mute">Nenhum pedido ainda.</p> : <ul className="space-y-2">{received.map(q => <li key={q.id} className="rounded-xl border border-line bg-card p-3 text-sm"><b>{q.client.name}</b> · {fmt(q.createdAt)}{q.scheduledAt && <> · agendado p/ {fmt(q.scheduledAt)}</>}<p>{q.message}</p></li>)}</ul>}
      </section>)}
      <section><h2 className="mb-2 text-lg font-bold">Meus pedidos</h2>
        {sent.length === 0 ? <p className="text-mute">Você ainda não pediu orçamentos.</p> : <ul className="space-y-2">{sent.map(q => <li key={q.id} className="rounded-xl border border-line bg-card p-3 text-sm"><a className="font-bold underline" href={`/p/${q.proId}`}>{q.pro.user.name}</a> · {fmt(q.createdAt)} · {q.status}<p>{q.message}</p></li>)}</ul>}</section>
      <section><h2 className="mb-2 text-lg font-bold">Favoritos</h2>
        {favs.length === 0 ? <p className="text-mute">Nenhum favorito salvo.</p> : <ul className="flex flex-wrap gap-2">{favs.map(f => <li key={f.proId}><a className="btn btn-ghost" href={`/p/${f.proId}`}>{f.pro.user.name}</a></li>)}</ul>}</section>
      <section id="conta" className="space-y-3 border-t border-line pt-6"><h2 className="text-lg font-bold">Conta</h2>
        <Form action="/api/auth/logout" submit="Sair" ghost />
        <details><summary className="cursor-pointer text-sm text-red-600">Excluir minha conta e meus dados</summary>
          <p className="my-2 text-sm text-mute">Isso apaga seu perfil, pedidos, avaliações e favoritos de forma definitiva.</p>
          <Form action="/api/account" method="DELETE" submit="Excluir definitivamente" ghost /></details></section>
    </div>
  );
}
