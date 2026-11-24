import Link from "next/link";
import Form from "@/components/Form";
export default function Login() {
  return (<div className="mx-auto max-w-sm"><h1 className="mb-4 text-2xl font-extrabold">Entrar</h1>
    <Form action="/api/auth/login" submit="Entrar" fields={[{ name: "email", label: "E-mail", type: "email" }, { name: "password", label: "Senha", type: "password" }]} />
    <p className="mt-4 text-sm">Novo por aqui? <Link href="/cadastro" className="underline">Crie sua conta</Link></p></div>);
}
