import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Form from "@/components/Form";

export const dynamic = "force-dynamic";
export default async function Profile({ params }: { params: { id: string } }) {
  const p = await db.professional.findFirst({ where: { id: params.id, approved: true },
    include: { user: true, category: true, city: true, reviews: { where: { hidden: false }, include: { user: true }, orderBy: { createdAt: "desc" } } } });
  if (!p) notFound();
  await db.professional.update({ where: { id: p.id }, data: { views: { increment: 1 } } });
  const u = await getUser();
  const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1) : null;
  const wa = `https://wa.me/${p.whatsapp.startsWith("55") ? p.whatsapp : "55" + p.whatsapp}?text=${encodeURIComponent("Olá! Vi seu perfil no ConectaPro.")}`;
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <section>
        <h1 className="text-3xl font-extrabold">{p.user.name}</h1>
        <p className="text-mute">{p.category.name} · {p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city.name}-{p.city.state}</p>
        <p className="mt-1 font-medium">{avg ? `★ ${avg} · ${p.reviews.length} avaliação(ões)` : "Ainda sem avaliações"}</p>
        <p className="mt-4 whitespace-pre-wrap">{p.bio || "Este profissional ainda não escreveu uma descrição."}</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-4">Chamar no WhatsApp</a>
        <h2 className="mb-2 mt-8 text-xl font-bold">Avaliações</h2>
        <ul className="space-y-3">{p.reviews.map(r => <li key={r.id} className="rounded-xl border border-line bg-card p-3"><p className="font-medium">{r.user.name} · {"★".repeat(r.rating)}</p><p className="text-sm">{r.comment}</p></li>)}</ul>
        {u && <div className="mt-4"><h3 className="mb-2 font-semibold">Deixe sua avaliação</h3>
          <Form action="/api/reviews" extra={{ proId: p.id }} submit="Publicar avaliação" fields={[{ name: "rating", label: "Nota", options: [5, 4, 3, 2, 1].map(n => ({ value: String(n), label: "★".repeat(n) })) }, { name: "comment", label: "Comentário", area: true }]} /></div>}
      </section>
      <aside className="space-y-6">
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 font-bold">Pedir orçamento</h2>
          {u ? <Form action="/api/quotes" extra={{ proId: p.id }} submit="Enviar pedido" fields={[{ name: "message", label: "O que você precisa?", area: true }, { name: "scheduledAt", label: "Data desejada (opcional)", type: "datetime-local", required: false }]} />
            : <p className="text-sm"><a className="underline" href="/login">Entre</a> ou <a className="underline" href="/cadastro">crie sua conta</a> para pedir orçamento.</p>}
        </div>
        {u && <div className="flex gap-2"><Form action="/api/favorites" extra={{ proId: p.id }} submit="♥ Favoritar" ghost /></div>}
        {u && <details className="rounded-xl border border-line bg-card p-4"><summary className="cursor-pointer text-sm font-medium">Denunciar perfil</summary>
          <div className="mt-3"><Form action="/api/reports" extra={{ proId: p.id }} submit="Enviar denúncia" ghost fields={[{ name: "reason", label: "Motivo", area: true }]} /></div></details>}
      </aside>
    </div>
  );
}
