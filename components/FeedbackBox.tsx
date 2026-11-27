"use client";
import { useState } from "react";

// Caixa "o que faltou hoje?": uma frase, anônima, no pé de cada ferramenta.
export default function FeedbackBox({ tool }: { tool: string }) {
  const [text, setText] = useState("");
  const [site, setSite] = useState(""); // isca para robôs: fica escondida
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending" || text.trim().length < 3) return;
    setState("sending"); setErr("");
    try {
      const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, tool, site }) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error ?? "Não foi possível enviar agora.");
        setState("idle");
        return;
      }
      setText(""); setState("done");
    } catch {
      setErr("Sem conexão. Tente de novo."); setState("idle");
    }
  }

  if (state === "done") return <div className="feedback"><p className="note" role="status">Obrigado! Sua frase ajuda a decidir a próxima ferramenta.</p></div>;

  return (
    <form className="feedback" onSubmit={send} style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
      <label htmlFor="fb"><b>Faltou alguma coisa hoje?</b> Conte em uma frase.</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <input id="fb" type="text" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Ex.: queria cortar o vídeo aqui mesmo" style={{ flex: "1 1 240px", minWidth: 0 }} />
        <input type="text" name="site" value={site} onChange={(e) => setSite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
        <button className="btn ghost" type="submit" disabled={state === "sending" || text.trim().length < 3}>{state === "sending" ? "Enviando…" : "Enviar"}</button>
      </div>
      <p className="count" style={{ marginTop: 6 }}>É anônimo. Não escreva dados pessoais (e-mail, telefone, senha).</p>
      {err && <p className="status" role="alert">{err}</p>}
    </form>
  );
}
