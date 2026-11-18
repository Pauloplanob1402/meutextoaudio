"use client";
import { useState } from "react";
import { BRAND_STEPS, brandSentence, buildBrandSummary } from "@/lib/toolkit2";
import { CopyButton, downloadText, useStored } from "./ui";

export default function BrandDNA() {
  const [name, setName] = useStored<string>("dna-nome", "");
  const [ans, setAns] = useStored<Record<string, string>>("dna-respostas", {});
  const [i, setI] = useState(0);
  const total = BRAND_STEPS.length;
  const review = i >= total;
  const step = BRAND_STEPS[Math.min(i, total - 1)];
  const done = BRAND_STEPS.filter((s) => (ans[s.id] ?? "").trim()).length;
  const summary = buildBrandSummary(name, ans);
  const sentence = brandSentence(ans);

  function printPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    w.document.write(`<!doctype html><meta charset="utf-8"><title>DNA de marca</title><style>body{font:16px/1.6 Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#12122B}h1{font-size:28px}h2{font-size:18px;margin:24px 0 4px;color:#3D3DF0}p{white-space:pre-wrap;margin:0 0 6px}small{color:#666}</style><h1>DNA de marca${name.trim() ? ` · ${esc(name.trim())}` : ""}</h1>${sentence ? `<p><b>${esc(sentence)}</b></p>` : ""}${BRAND_STEPS.map((s, n) => `<h2>${n + 1}. ${esc(s.title)}</h2><small>${esc(s.question)}</small><p>${esc((ans[s.id] ?? "").trim() || "(ainda não preenchido)")}</p>`).join("")}`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="tool">
      <ol className="path wiz" aria-label="Etapas">
        {BRAND_STEPS.map((s, n) => (
          <li key={s.id} className={i === n ? "on" : (ans[s.id] ?? "").trim() ? "done" : ""}>
            <button type="button" onClick={() => setI(n)} aria-label={`Etapa ${n + 1}: ${s.title}`}><b>{n + 1}</b></button>
          </li>
        ))}
        <li className={review ? "on" : ""}><button type="button" onClick={() => setI(total)} aria-label="Resumo final"><b>✓</b></button></li>
      </ol>

      {!review ? (
        <>
          <div className="field">
            {i === 0 && (
              <>
                <label htmlFor="nome">Nome do canal ou da marca (opcional)</label>
                <input id="nome" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
              </>
            )}
          </div>
          <h2 className="steph">Etapa {i + 1} de {total}: {step.title}</h2>
          <p className="note">{step.why}</p>
          <div className="field">
            <label htmlFor="resp">{step.question}</label>
            <textarea id="resp" value={ans[step.id] ?? ""} onChange={(e) => setAns({ ...ans, [step.id]: e.target.value })} placeholder={`Exemplo: ${step.example}`} />
          </div>
          <div className="rrow">
            <button className="btn ghost" type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Voltar</button>
            <button className="btn go" type="button" onClick={() => setI(i + 1)}>{i === total - 1 ? "Ver o resumo" : "Próxima etapa"}</button>
          </div>
        </>
      ) : (
        <>
          <h2 className="steph">Seu DNA de marca</h2>
          <p className="count">{done} de {total} etapas preenchidas</p>
          {sentence && <p className="nichenote"><b>Frase-guia:</b> {sentence}</p>}
          <div className="out">{summary}</div>
          <div className="rrow">
            <CopyButton text={summary} label="Copiar resumo" />
            <button className="btn ghost" type="button" onClick={() => downloadText(summary, "dna-de-marca.txt")}>Baixar .txt</button>
            <button className="btn ghost" type="button" onClick={printPdf}>Imprimir ou salvar em PDF</button>
            <button className="btn ghost" type="button" onClick={() => setI(0)}>Editar respostas</button>
          </div>
        </>
      )}
      <p className="note">Inspirado nos 7 elementos do livro Primal Branding. Tudo fica salvo só neste aparelho.</p>
    </div>
  );
}
