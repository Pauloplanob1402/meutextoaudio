"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "busy") return;
    setState("busy");
    setMsg("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setState("error");
      setMsg(error.status === 429 ? "Muitas tentativas. Espere um pouco e tente de novo." : "Não consegui enviar o link agora. Confira o e-mail e tente de novo.");
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return (
      <div role="status">
        <h2>Confira seu e-mail</h2>
        <p className="lead">Enviamos um link de acesso para <strong>{email}</strong>. É só tocar nele para entrar. Se não chegar em alguns minutos, olhe a caixa de spam.</p>
        <button className="link" type="button" onClick={() => setState("idle")}>Usar outro e-mail</button>
      </div>
    );

  return (
    <form onSubmit={submit}>
      <label className="big" htmlFor="email">Seu e-mail</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="field" />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn go" type="submit" disabled={state === "busy"}>{state === "busy" ? "Enviando…" : "Receber link de acesso"}</button>
      </div>
      <p className="status" role="status" aria-live="polite" style={{ marginTop: 12 }}>{msg || "Sem senha: enviamos um link para o seu e-mail."}</p>
    </form>
  );
}
