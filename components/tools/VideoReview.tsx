"use client";
import Link from "next/link";
import { useState } from "react";
import { LEVEL_LABEL, reviewVideo, trendOf, type ReviewInput, type Video } from "@/lib/sistema";
import { getTool } from "@/lib/tools";
import { CopyButton, useStored } from "./ui";

type Form = { name: string; views: string; ctr: string; retention: string; ret30: string; likes: string; comments: string; subs: string };
type Saved = { id: string; date: string; form: Form };
const EMPTY: Form = { name: "", views: "", ctr: "", retention: "", ret30: "", likes: "", comments: "", subs: "" };
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return s.trim() === "" || Number.isNaN(n) ? null : n; };
const toInput = (f: Form): ReviewInput => ({ views: num(f.views), ctr: num(f.ctr), retention: num(f.retention), ret30: num(f.ret30), likes: num(f.likes), comments: num(f.comments), subs: num(f.subs) });

const FIELDS: { k: keyof Form; label: string; hint: string }[] = [
  { k: "views", label: "Visualizações", hint: "Total nos primeiros 7 dias." },
  { k: "ctr", label: "Taxa de cliques das impressões (%)", hint: "No YouTube Studio: Análise, aba Alcance." },
  { k: "retention", label: "Porcentagem média assistida (%)", hint: "No Studio: Análise, aba Envolvimento." },
  { k: "ret30", label: "Ainda assistindo aos 30 segundos (%) (opcional)", hint: "No gráfico de retenção de público." },
  { k: "likes", label: "Curtidas (opcional)", hint: "" },
  { k: "comments", label: "Comentários (opcional)", hint: "" },
  { k: "subs", label: "Inscritos ganhos (opcional)", hint: "" },
];

export default function VideoReview() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [hist, setHist] = useStored<Saved[]>("revisoes-de-video", []);
  const [videos] = useStored<Video[]>("painel-videos", []);
  const [msg, setMsg] = useState("");
  const input = toInput(form);
  const r = reviewVideo(input);
  const before = hist.find((h) => JSON.stringify(h.form) !== JSON.stringify(form)); // a mais recente que seja diferente da tela atual
  const prev = before ? toInput(before.form) : null;
  const set = (k: keyof Form, v: string) => setForm({ ...form, [k]: v });
  const arrow = (a: number | null, b: number | null | undefined) => {
    const t = trendOf(a, b ?? null);
    return t === "subiu" ? " · subiu em relação à revisão anterior" : t === "caiu" ? " · caiu em relação à revisão anterior" : t === "igual" ? " · igual à revisão anterior" : "";
  };

  function save() {
    if (!r.metrics.length) return;
    const d = new Date();
    const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    setHist([{ id: Date.now().toString(36), date, form }, ...hist].slice(0, 30));
    setMsg("Revisão salva neste aparelho.");
  }

  const text = [
    `REVISÃO: ${form.name.trim() || "vídeo sem nome"}`,
    ...r.metrics.map((m) => `${m.label}: ${m.value} (${LEVEL_LABEL[m.level]})`),
    "", `Diagnóstico: ${r.verdict.title}. ${r.verdict.text}`,
    ...(r.actions.length ? ["", "Para o próximo vídeo:", ...r.actions.map((a) => `- ${a.text}`)] : []),
  ].join("\n");

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="vn">Nome do vídeo</label>
        <input id="vn" type="text" list="vids" value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120} />
        <datalist id="vids">{videos.map((v) => <option key={v.id} value={v.title} />)}</datalist>
        <span className="count">Se você usa o Painel do vídeo, os títulos aparecem aqui.</span>
      </div>

      <div className="triple p3 rv">
        {FIELDS.map((f) => (
          <div className="field" key={f.k}>
            <label htmlFor={`f-${f.k}`}>{f.label}</label>
            <input id={`f-${f.k}`} type="text" inputMode="decimal" value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} />
            {f.hint && <span className="count">{f.hint}</span>}
          </div>
        ))}
      </div>

      <div className="big-out" aria-live="polite">
        <div className="num sm">{r.verdict.title}</div>
        <p style={{ marginTop: 8 }}>{r.verdict.text}</p>
      </div>

      {r.metrics.length > 0 && (
        <ul className="rmetrics">
          {r.metrics.map((m) => (
            <li key={m.id} className={`lvl-${m.level}`}>
              <b>{m.value}</b>
              <span>{m.label}</span>
              <small>{LEVEL_LABEL[m.level]} · afeta: {m.area}{m.id === "ctr" ? arrow(input.ctr, prev?.ctr) : m.id === "ret" ? arrow(input.retention, prev?.retention) : ""}</small>
            </li>
          ))}
        </ul>
      )}

      {r.actions.length > 0 && (
        <div className="field">
          <span>O que fazer no próximo vídeo</span>
          <ul className="fixes">
            {r.actions.map((a) => (
              <li key={a.text}>{a.text}{a.tool && getTool(a.tool) && <> <Link href={`/ferramentas/${a.tool}`} className="inl">Abrir {getTool(a.tool)!.title}</Link></>}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rrow">
        <button className="btn go" type="button" onClick={save} disabled={!r.metrics.length}>Salvar esta revisão</button>
        <CopyButton text={text} label="Copiar resumo" disabled={!r.metrics.length} />
        <button className="btn ghost" type="button" onClick={() => { setForm(EMPTY); setMsg(""); }}>Nova revisão</button>
      </div>
      {msg && <p className="status" role="status">{msg}</p>}

      {hist.length > 0 && (
        <div className="field" style={{ marginTop: 20 }}>
          <span>Revisões salvas</span>
          <ul className="hist">
            {hist.map((h) => {
              const hr = reviewVideo(toInput(h.form));
              return (
                <li key={h.id}>
                  <button type="button" className="link" onClick={() => setForm(h.form)}>{h.form.name || "Vídeo sem nome"}</button>
                  <span className="count"> · {h.date} · {hr.verdict.title}</span>
                  <button type="button" className="link" aria-label="Apagar revisão" onClick={() => setHist(hist.filter((x) => x.id !== h.id))}>Apagar</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="note">As faixas (por exemplo, taxa de cliques acima de 4,5% e retenção acima de 40% como “bom”) são aproximadas e variam por nicho e tamanho do canal. Use para comparar os seus vídeos entre si, não com os dos outros. Os números não saem do seu aparelho.</p>
    </div>
  );
}
