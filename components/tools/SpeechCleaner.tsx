"use client";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_CLEAN, cleanForSpeech, speechIssues, type CleanOptions } from "@/lib/sistema2";
import { CopyButton, useStored } from "./ui";

const OPTS: { k: keyof CleanOptions; label: string }[] = [
  { k: "numbers", label: "Números por extenso (2026, R$ 10,50, 50%, 10h)" },
  { k: "abbr", label: "Abreviações (vc, tb, etc., Dr.)" },
  { k: "urls", label: "Links viram “o link na descrição”" },
  { k: "symbols", label: "Tirar emojis, #, *, travessões e símbolos" },
  { k: "parens", label: "Trocar parênteses por vírgulas" },
];

export default function SpeechCleaner() {
  const [text, setText] = useStored<string>("limpador-texto", "");
  const [opts, setOpts] = useState<CleanOptions>(DEFAULT_CLEAN);
  const [msg, setMsg] = useState("");
  const out = text.trim() ? cleanForSpeech(text, opts) : "";
  const iss = out ? speechIssues(out) : null;

  function sendToAudio() {
    try { localStorage.setItem("draft", out); setMsg("Texto enviado. Abra a página inicial para gerar o áudio."); } catch { setMsg("Não consegui enviar neste navegador."); }
  }

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="lt">Cole o roteiro</label>
        <textarea id="lt" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o texto escrito para ler. A ferramenta deixa do jeito que se fala." />
      </div>
      <div className="field">
        <span>O que arrumar</span>
        <ul className="checks">
          {OPTS.map((o) => (
            <li key={o.k}><label><input type="checkbox" checked={opts[o.k]} onChange={(e) => setOpts({ ...opts, [o.k]: e.target.checked })} /><span>{o.label}</span></label></li>
          ))}
        </ul>
      </div>

      {out && (
        <>
          <h2 className="steph">Texto pronto para falar</h2>
          <div className="out">{out}</div>
          <div className="rrow">
            <CopyButton text={out} label="Copiar texto" />
            <button className="btn ghost" type="button" onClick={sendToAudio}>Enviar para o Texto em áudio</button>
            {msg && <Link className="link" href="/">Abrir a página inicial</Link>}
          </div>
          {msg && <p className="status" role="status">{msg}</p>}
          {iss && (iss.longSentences.length > 0 || iss.acronyms.length > 0) && (
            <div className="field" style={{ marginTop: 16 }}>
              <span>Para olhar com calma</span>
              {iss.longSentences.length > 0 && (
                <>
                  <p className="count">Frases com mais de 25 palavras ficam cansativas de ouvir. Considere dividir:</p>
                  <ul className="problems">{iss.longSentences.slice(0, 5).map((s) => <li key={s.text}>({s.words} palavras) {s.text.slice(0, 90)}{s.text.length > 90 ? "…" : ""}</li>)}</ul>
                </>
              )}
              {iss.acronyms.length > 0 && <p className="count">Siglas no texto: <b>{iss.acronyms.join(", ")}</b>. A voz pode ler como palavra. Se precisar, escreva como se fala (ex.: “ésse ê ó” no lugar de “SEO”).</p>}
            </div>
          )}
        </>
      )}
      <p className="note">Confira o resultado antes de gerar o áudio. O gênero dos números (uma, duas) é ajustado para as palavras mais comuns, como horas, semanas e pessoas, mas outras palavras podem escapar. O texto não sai do seu aparelho.</p>
      </div>
  );
}
