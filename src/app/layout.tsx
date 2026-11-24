import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import Sw from "@/components/Sw";
import Form from "@/components/Form";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font" });
export const metadata: Metadata = { title: { default: "ConectaPro — profissionais de confiança perto de você", template: "%s | ConectaPro" },
  description: "Encontre eletricistas, pedreiros, diaristas e outros profissionais locais, peça orçamento e fale direto pelo WhatsApp.",
  manifest: "/manifest.webmanifest", icons: { apple: "/icons/icon-192.png" }, appleWebApp: { capable: true, title: "ConectaPro" } };
export const viewport: Viewport = { themeColor: "#2342C4" };

export default async function Root({ children }: { children: React.ReactNode }) {
  const u = await getUser();
  const nav = [{ h: "/", t: "Buscar" }, ...(u ? [{ h: u.role === "ADMIN" ? "/admin" : u.role === "PRO" ? "/painel" : "/painel", t: u.role === "ADMIN" ? "Admin" : "Painel" }] : [{ h: "/login", t: "Entrar" }])];
  return (
    <html lang="pt-BR" className={font.variable}>
      <body className="font-sans min-h-screen pb-20 md:pb-0">
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-brand">Conecta<span className="text-sun">Pro</span></Link>
            <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
              {nav.map(n => <Link key={n.h} href={n.h}>{n.t}</Link>)}
              {u ? <Form action="/api/auth/logout" submit="Sair" ghost /> : <Link href="/cadastro" className="btn">Criar conta</Link>}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-sm text-mute">
          <Link href="/termos" className="underline">Termos de uso</Link> · <Link href="/privacidade" className="underline">Privacidade</Link>
        </footer>
        <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t border-line bg-card text-center text-sm font-medium md:hidden">
          <Link href="/" className="py-3">Buscar</Link>
          <Link href={u ? "/painel" : "/login"} className="py-3">{u ? "Painel" : "Entrar"}</Link>
          <Link href={u ? (u.role === "ADMIN" ? "/admin" : "/painel#conta") : "/cadastro"} className="py-3">{u ? "Conta" : "Cadastrar"}</Link>
        </nav>
        <Sw />
      </body>
    </html>
  );
}
