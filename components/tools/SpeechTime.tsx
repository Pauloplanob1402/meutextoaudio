"use client";
import { useEffect, useState } from "react";
import { speechSeconds } from "@/lib/toolkit";
import { formatDuration, savedNarrationWpm } from "@/lib/tts";
import { fmtNum } from "./ui";

const PACES = [
  { label: "Calmo", wpm: 120 },
  { label: "Normal", wpm: 150 },
  { label: "Rápido", wpm: 180 },
];

export default function SpeechTime() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(150);
  const [pace, setPace] = useState("Normal");
  const [nar, setNar] = useState(0); // ritmo real da voz do Sauim neste aparelho (0 até carregar)
  useEffect(() => { setNar(savedNarrationWpm()); }, []);
  const paces = nar ? [...PACES, { label: "Narração do Sauim", wpm: nar }] : PACES;
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
          {paces.map((p) => (
            <button key={p.label} type="button" className={pace === p.label ? "on" : ""} onClick={() => { setWpm(p.wpm); setPace(p.label); }}>
              {p.label} ({p.wpm} palavras por minuto)
            </button>
          ))}
        </div>
      </div>
      <div className="big-out" aria-live="polite">
        <div className="num">{r.words ? formatDuration(r.seconds) : "0 s"}</div>
        <div className="count">{fmtNum(r.words)} palavras · {fmtNum(r.chars)} caracteres{r.pause ? ` · ${formatDuration(r.pause)} de pausas` : ""}</div>
      </div>
      <p className="note">É uma estimativa. Cada pessoa fala num ritmo, então grave um trecho curto e compare. Pausas escritas como [PAUSA - 3 segundos] entram na conta. “Narração do Sauim” usa o ritmo medido na voz que você escolheu no Texto em áudio.</p>
    </div>
  );
}
