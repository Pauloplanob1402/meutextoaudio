"use client";
import { useEffect, useState } from "react";
import { analyzeBeats, BEAT_HELP, type Status } from "@/lib/batidas";
import { formatDuration, savedNarrationWpm } from "@/lib/tts";
import { useStored } from "./ui";

const LABEL: Record<Status, string> = { ok: "Está no roteiro", atencao: "Vale ajustar", falta: "Não encontrado" };
const COLOR: Record<Status, string> = { ok: "#2f7d4f", atencao: "#b7791f", falta: "#b83232" };
const PACES = [{ label: "Calmo", wpm: 120 }, { label: "Normal", wpm: 150 }, { label: "Rápido", wpm: 180 }];

export default function FourBeats() {
  const [text, setText] = useStored<string>("batidas-texto", "");
  const [wpm, setWpm] = useState(150);
  const [nar, setNar] = useState(0);
  useEffect(() => { const n = savedNarrationWpm(); setNar(n); setWpm(n); }, []);
  const paces = nar ? [...PACES, { label: "Narração do Sauim", wpm: nar }] : PACES;
  const r = analyzeBeats(text, wpm);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="bt">Cole o seu roteiro</label>
        <textarea id="bt" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole o roteiro inteiro. A ferramenta separa as 4 batidas pela posição e pelas frases. Se preferir separar você mesmo, escreva uma linha só com --- entre as 4 partes." />
      </div>
      <div className="field">
        <span>Ritmo da fala</span>
        <div className="speeds" role="group" aria-label="Ritmo">
          {paces.map((p) => (
            <button key={p.label} type="button" className={wpm === p.wpm ? "on" : ""} onClick={() => setWpm(p.wpm)}>{p.label}</button>
          ))}
        </div>
      </div>

      {!r && <p className="note">Cole o roteiro para ver as 4 batidas: gancho, conflito, virada e resolução.</p>}

      {r && (
        <div className="result">
          <h2>Seu vídeo em 4 batidas</h2>
          <p className="note">Tempo total falado: <b>{formatDuration(r.totalSeconds)}</b> · {r.manual ? "partes separadas por você" : "partes encontradas automaticamente"}</p>
          <div role="img" aria-label="Proporção de cada batida" style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", margin: "10px 0 14px", background: "var(--line)" }}>
            {r.beats.map((b) => <span key={b.id} title={`${b.name} ${b.share}%`} style={{ width: `${b.share}%`, background: COLOR[b.status], borderRight: "2px solid var(--bg, #fff)" }} />)}
          </div>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {r.beats.map((b, i) => (
              <li key={b.id} style={{ padding: "12px 0", borderTop: "1px solid var(--line)" }}>
                <p style={{ margin: 0 }}>
                  <b>{i + 1}. {b.name}</b> · <span style={{ color: COLOR[b.status], fontWeight: 600 }}>{LABEL[b.status]}</span>
                  {b.words > 0 && <span className="count"> · {b.share}% · {formatDuration(b.seconds)}</span>}
                </p>
                <p className="count" style={{ margin: "2px 0 0" }}>{BEAT_HELP[b.id]}</p>
                {b.found && <p className="note" style={{ margin: "6px 0 0" }}>Encontrado: “{b.found}”</p>}
                {b.tips.length > 0 && <ul className="problems">{b.tips.map((t) => <li key={t}>{t}</li>)}</ul>}
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="note">A análise usa regras simples sobre as palavras do texto, não entende o sentido. Use como um segundo olhar e confie no seu ouvido. Seu roteiro fica só neste aparelho.</p>
    </div>
  );
}
