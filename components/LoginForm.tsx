"use client";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { TURNSTILE_SITE_KEY } from "./Turnstile";

type Mode = "entrar" | "criar" | "link";

export default function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState("");
  const [round, setRound] = useState(0); // cada tentativa precisa de uma verificação nova
  const onToken = useCallback((t: string) => setToken(t), []);
  const callback = () => `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  function fail(text: string) {
    setState("error");
    setMsg(text);
  }

  async function google() {
    setMsg("");
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) fail("Não foi possível entrar com o Google agora. Tente novamente ou use o e-mail.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || state === "busy") return;
    if (mode !== "link" && password.length < 8) { fail("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (TURNSTILE_SITE_KEY && !token) { setMsg("Aguarde a conclusão da verificação de segurança e tente novamente."); return; }
    setState("busy");
    setMsg("");
    const auth = createClient().auth;
    const captcha = TURNSTILE_SITE_KEY ? { captchaToken: token } : {};
    let error: { status?: number; message?: string } | null = null;
    let session = false;

    if (mode === "entrar") {
      const r = await auth.signInWithPassword({ email: email.trim(), password, options: captcha });
      error = r.error;
      session = Boolean(r.data?.session);
    } else if (mode === "criar") {
      const r = await auth.signUp({ email: email.trim(), password, options: { ...captcha, emailRedirectTo: callback() } });
      error = r.error;
      session = Boolean(r.data?.session);
    } else {
      const r = await auth.signInWithOtp({ email: email.trim(), options: { ...captcha, emailRedirectTo: callback() } });
      error = r.error;
    }

    setToken("");
    setRound((n) => n + 1);
    if (error) {
      const m = error.message ?? "";
      if (error.status === 429) fail("Muitas tentativas. Aguarde um pouco e tente novamente.");
      else if (mode === "entrar") fail("E-mail ou senha incorretos. Se preferir, receba um link de acesso por e-mail.");
      else if (mode === "criar" && /registered|already/i.test(m)) fail("Este e-mail já tem conta. Entre com a sua senha.");
      else if (mode === "criar") fail("Não foi possível criar a conta. Confira os dados e tente novamente.");
      else fail("Não foi possível enviar o link agora. Confira o e-mail e tente novamente.");
      return;
    }
    if (session) { window.location.assign(next); return; } // senha certa, ou conta criada sem confirmação por e-mail
    setState("sent");
  }

  if (state === "sent")
    return (
      <div role="status">
        <h2>Confira o seu e-mail</h2>
        <p className="lead">Enviamos uma mensagem para <strong>{email}</strong>. {mode === "criar" ? "Toque no link para confirmar a conta e entrar." : "Toque no link para entrar."} Se não chegar em alguns minutos, verifique a caixa de spam.</p>
        <button className="link" type="button" onClick={() => setState("idle")}>Voltar</button>
      </div>
    );

  const busy = state === "busy";
  const label = mode === "entrar" ? "Entrar" : mode === "criar" ? "Criar conta" : "Receber link de acesso";

  return (
    <form onSubmit={submit}>
      <button className="btn ghost" type="button" onClick={google} style={{ width: "100%" }}>Continuar com o Google</button>
      <p className="note" style={{ textAlign: "center", margin: "14px 0" }}>ou</p>

      <label className="big" htmlFor="email">Seu e-mail</label>
      <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className="field" />
      {mode !== "link" && (
        <>
          <label className="big" htmlFor="senha" style={{ marginTop: 14 }}>Senha</label>
          <input id="senha" type="password" required minLength={8} autoComplete={mode === "criar" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" className="field" />
        </>
      )}
      <Turnstile key={round} onToken={onToken} />
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn go" type="submit" disabled={busy}>{busy ? "Aguarde…" : label}</button>
      </div>
      <p className="status" role="status" aria-live="polite" style={{ marginTop: 12 }}>{msg}</p>

      <p className="note" style={{ marginTop: 8 }}>
        {mode === "entrar" && <>Ainda não tem conta? <button className="link" type="button" onClick={() => { setMode("criar"); setMsg(""); }}>Criar conta</button> · <button className="link" type="button" onClick={() => { setMode("link"); setMsg(""); }}>Esqueci a senha</button></>}
        {mode === "criar" && <>Já tem conta? <button className="link" type="button" onClick={() => { setMode("entrar"); setMsg(""); }}>Entrar</button></>}
        {mode === "link" && <>Enviamos um link que entra direto, sem senha. <button className="link" type="button" onClick={() => { setMode("entrar"); setMsg(""); }}>Voltar</button></>}
      </p>
    </form>
  );
}
