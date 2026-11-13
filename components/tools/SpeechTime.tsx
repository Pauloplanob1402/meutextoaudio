"use client";
import { useState } from "react";
import { speechSeconds } from "@/lib/toolkit";
import { formatDuration } from "@/lib/tts";
import { fmtNum } from "./ui";

const PACES = [
  { label: "Calmo", wpm: 120 },
  { label: "Normal", wpm: 150 },
  { label: "Rápido", wpm: 180 },
];

export default function SpeechTime() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(150);
  const r = speechSeconds(text, wpm);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="t">Seu texto</label>
        <textarea id="t" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole ou escreva o texto aqui" />
      </div>
      <div className="field">
        <span>Ritmo da fala</span>
        <div className="speeds" role="group" aria-label="Ritmo da fala">
          {PACES.map((p) => (
            <button key={p.wpm} type="button" className={wpm === p.wpm ? "on" : ""} onClick={() => setWpm(p.wpm)}>
              {p.label} ({p.wpm} palavras por minuto)
            </button>
          ))}
        </div>
      </div>
      <div className="big-out" aria-live="polite">
        <div className="num">{r.words ? formatDuration(r.seconds) : "0 s"}</div>
        <div className="count">{fmtNum(r.words)} palavras · {fmtNum(r.chars)} caracteres{r.pause ? ` · ${formatDuration(r.pause)} de pausas` : ""}</div>
      </div>
      <p className="note">É uma estimativa. Cada pessoa fala num ritmo, então grave um trecho curto e compare. Pausas escritas como [PAUSA - 3 segundos] entram na conta.</p>
    </div>
  );
}
