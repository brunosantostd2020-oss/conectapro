"use client";
import { useState } from "react";

type Field = { name: string; label: string; type?: string; options?: { value: string; label: string }[]; area?: boolean; required?: boolean };
export default function Form({ action, method = "POST", fields = [], extra = {}, submit, ghost, redirect }:
  { action: string; method?: string; fields?: Field[]; extra?: Record<string, string>; submit: string; ghost?: boolean; redirect?: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const f = new FormData(e.currentTarget);
    const body: Record<string, string> = { ...extra };
    f.forEach((v, k) => { if (typeof v === "string" && v !== "") body[k] = v; });
    try {
      const r = await fetch(action, { method, headers: { "Content-Type": "application/json" }, body: method === "DELETE" ? undefined : JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) setMsg({ ok: false, t: d.error ?? "Algo deu errado. Tente de novo." });
      else if (d.redirect ?? redirect) window.location.href = d.redirect ?? redirect!;
      else { setMsg({ ok: true, t: d.message ?? "Pronto!" }); (e.target as HTMLFormElement).reset(); }
    } catch { setMsg({ ok: false, t: "Sem conexão. Verifique a internet." }); }
    setBusy(false);
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {fields.map(f => (
        <label key={f.name} className="block text-sm font-medium">
          {f.label}
          {f.options ? (
            <select name={f.name} required={f.required !== false} className="input mt-1">{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          ) : f.area ? (
            <textarea name={f.name} required={f.required !== false} rows={3} className="input mt-1" />
          ) : f.type === "checkbox" ? (
            <input type="checkbox" name={f.name} value="sim" required className="ml-2 h-4 w-4 align-middle" />
          ) : (
            <input name={f.name} type={f.type ?? "text"} required={f.required !== false} className="input mt-1" />
          )}
        </label>
      ))}
      <button disabled={busy} className={`btn ${ghost ? "btn-ghost" : ""}`}>{busy ? "Aguarde…" : submit}</button>
      {msg && <p role="status" className={`text-sm ${msg.ok ? "text-brand" : "text-red-600"}`}>{msg.t}</p>}
    </form>
  );
}
