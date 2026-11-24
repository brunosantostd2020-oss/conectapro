import { db } from "@/lib/db";
import Form from "@/components/Form";
export const dynamic = "force-dynamic";
export default async function Signup({ searchParams }: { searchParams: { tipo?: string } }) {
  const [cities, cats] = await Promise.all([db.city.findMany({ orderBy: { name: "asc" } }), db.category.findMany({ orderBy: { name: "asc" } })]);
  const pro = searchParams.tipo === "profissional";
  const base = [{ name: "name", label: "Nome" }, { name: "email", label: "E-mail", type: "email" }, { name: "password", label: "Senha (mín. 8 caracteres)", type: "password" }];
  const proFields = [
    { name: "categoryId", label: "Sua categoria", options: cats.map(c => ({ value: c.id, label: c.name })) },
    { name: "cityId", label: "Cidade", options: cities.map(c => ({ value: c.id, label: `${c.name}-${c.state}` })) },
    { name: "neighborhood", label: "Bairro", required: false }, { name: "whatsapp", label: "WhatsApp com DDD (só números)" },
    { name: "bio", label: "Conte sobre seu trabalho", area: true, required: false }];
  return (<div className="mx-auto max-w-md"><h1 className="mb-2 text-2xl font-extrabold">{pro ? "Cadastro de profissional" : "Criar conta"}</h1>
    <p className="mb-4 text-sm"><a className="underline" href={pro ? "/cadastro" : "/cadastro?tipo=profissional"}>{pro ? "Sou cliente" : "Sou profissional"}</a></p>
    <Form action="/api/auth/register" submit="Criar conta" extra={{ role: pro ? "PRO" : "CLIENT" }}
      fields={[...base, ...(pro ? proFields : []), { name: "consent", label: "Li e aceito os Termos de uso e a Política de Privacidade", type: "checkbox" }]} />
    {pro && <p className="mt-3 text-sm text-mute">Seu perfil aparece nas buscas depois da aprovação da nossa equipe.</p>}</div>);
}
