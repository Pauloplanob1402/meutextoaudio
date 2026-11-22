"use client";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { TURNSTILE_SITE_KEY } from "./Turnstile";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState("");
  const [round, setRound] = useState(0); // cada tentativa precisa de uma verificação nova
  const onToken = useCallback((t: string) => setToken(t), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "busy") return;
    if (TURNSTILE_SITE_KEY && !token) { setMsg("Aguarde a conclusão da verificação de segurança e tente novamente."); return; }
    setState("busy");
    setMsg("");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { ...(TURNSTILE_SITE_KEY ? { captchaToken: token } : {}), emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setToken("");
    setRound((n) => n + 1);
    if (error) {
      setState("error");
      setMsg(error.status === 429 ? "Muitas tentativas. Aguarde um pouco e tente novamente." : "Não foi possível enviar o link agora. Confira o e-mail e tente novamente.");
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return (
      <div role="status">
        <h2>Confira o seu e-mail</h2>
        <p className="lead">Enviamos um link de acesso para <strong>{email}</strong>. Toque nele para entrar. Se não chegar em alguns minutos, verifique a caixa de spam.</p>
        <button className="link" type="button" onClick={() => setState("idle")}>Usar outro e-mail</button>
      </div>
    );

  return (
    <form onSubmit={submit}>
      <label className="big" htmlFor="email">Seu e-mail</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="field" />
      <Turnstile key={round} onToken={onToken} />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn go" type="submit" disabled={state === "busy"}>{state === "busy" ? "Enviando…" : "Receber link de acesso"}</button>
      </div>
      <p className="status" role="status" aria-live="polite" style={{ marginTop: 12 }}>{msg || "Sem senha: você recebe um link de acesso no seu e-mail."}</p>
    </form>
  );
}
