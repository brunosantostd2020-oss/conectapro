import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const PLAN_LABEL = { FREE: "", PRO: "Destaque", PREMIUM: "Premium" } as const;

export default async function Home({ searchParams }: { searchParams: { cidade?: string; categoria?: string; bairro?: string } }) {
  const [cities, cats] = await Promise.all([db.city.findMany({ orderBy: { name: "asc" } }), db.category.findMany({ orderBy: { name: "asc" } })]);
  const { cidade, categoria, bairro } = searchParams;
  const pros = await db.professional.findMany({
    where: { approved: true, ...(cidade ? { city: { slug: cidade } } : {}), ...(categoria ? { category: { slug: categoria } } : {}),
      ...(bairro ? { neighborhood: { contains: bairro, mode: "insensitive" } } : {}) },
    include: { user: true, category: true, city: true, reviews: { where: { hidden: false } } },
    orderBy: [{ plan: "desc" }, { views: "desc" }], take: 40 });
  const hero = !cidade && !categoria && !bairro;
  return (
    <>
      <section className="rounded-2xl bg-brand px-5 py-8 text-white md:px-8">
        <h1 className="max-w-xl text-3xl font-extrabold leading-tight md:text-4xl">Quem resolve, perto de você, em Cataguases.</h1>
        <p className="mt-2 max-w-lg opacity-90">Eletricista, diarista, pedreiro e mais. Veja avaliações de vizinhos e chame direto no WhatsApp.</p>
        <form className="mt-5 grid gap-2 md:grid-cols-4" role="search">
          <select name="categoria" defaultValue={categoria ?? ""} className="input text-ink" aria-label="Categoria"><option value="">Todas as categorias</option>{cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
          <select name="cidade" defaultValue={cidade ?? ""} className="input text-ink" aria-label="Cidade"><option value="">Todas as cidades</option>{cities.map(c => <option key={c.id} value={c.slug}>{c.name}-{c.state}</option>)}</select>
          <input name="bairro" defaultValue={bairro ?? ""} placeholder="Bairro" aria-label="Bairro" className="input text-ink" />
          <button className="btn bg-sun !text-[#171A24]">Buscar profissionais</button>
        </form>
      </section>
      <h2 className="mb-3 mt-8 text-xl font-bold">{hero ? "Profissionais em destaque" : `${pros.length} profissional(is) encontrado(s)`}</h2>
      {pros.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-mute">Nenhum profissional por aqui ainda. Tente outra categoria ou <Link href="/cadastro" className="underline">cadastre-se como profissional</Link>.</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {pros.map(p => {
          const avg = p.reviews.length ? (p.reviews.reduce((a, r) => a + r.rating, 0) / p.reviews.length).toFixed(1) : null;
          return (
            <li key={p.id}>
              <Link href={`/p/${p.id}`} className="block rounded-xl border border-line bg-card p-4 hover:border-brand">
                <div className="flex items-start justify-between gap-2">
                  <div><p className="font-bold">{p.user.name}</p><p className="text-sm text-mute">{p.category.name} · {p.neighborhood || p.city.name}</p></div>
                  {p.plan !== "FREE" && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-bold text-[#171A24]">{PLAN_LABEL[p.plan]}</span>}
                </div>
                <p className="mt-2 line-clamp-2 text-sm">{p.bio || "Sem descrição ainda."}</p>
                <p className="mt-2 text-sm font-medium">{avg ? `★ ${avg} (${p.reviews.length})` : "Sem avaliações"}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
