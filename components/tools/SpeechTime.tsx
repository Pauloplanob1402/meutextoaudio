"use client";
import { useEffect, useState } from "react";
import { speechSeconds } from "@/lib/toolkit";
import { WORDS_PER_MINUTE, estimateSeconds, formatDuration, scriptStats } from "@/lib/tts";
import { getVoice } from "@/lib/voices";
import { fmtNum } from "./ui";

// wpm 0 = ritmo da voz da SAUIM (mesma conta do Texto em Áudio). Os outros são ritmos de quem grava a própria voz.
const PACES = [
  { label: "", wpm: 0 },
  { label: "Calmo", wpm: 120 },
  { label: "Normal", wpm: 150 },
  { label: "Rápido", wpm: 180 },
];

export default function SpeechTime() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(0);
  // Voz que a pessoa usa no Texto em Áudio e o ritmo real dela, aprendido nos áudios já gerados neste aparelho.
  const [voice, setVoice] = useState({ name: "Faber", wpm: WORDS_PER_MINUTE });
  useEffect(() => {
    try {
      const v = getVoice(localStorage.getItem("voz"));
      const m = JSON.parse(localStorage.getItem("wpm") || "{}");
      const learned = m && typeof m === "object" ? Number(m[v.id]) : 0;
      setVoice({ name: v.name, wpm: learned > 0 ? learned : WORDS_PER_MINUTE });
    } catch {}
  }, []);

  const byVoice = wpm === 0;
  const h = speechSeconds(text, byVoice ? 150 : wpm);
  const seconds = byVoice ? estimateSeconds(text, 1, voice.wpm) : h.seconds;
  const pause = byVoice ? scriptStats(text).pauses : h.pause;

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
              {p.wpm === 0 ? `Voz da SAUIM · ${voice.name} (igual ao áudio gerado)` : `${p.label} (${p.wpm} palavras por minuto)`}
            </button>
          ))}
        </div>
      </div>
      <div className="big-out" aria-live="polite">
        <div className="num">{h.words ? formatDuration(seconds) : "0 s"}</div>
        <div className="count">{fmtNum(h.words)} palavras · {fmtNum(h.chars)} caracteres{pause ? ` · ${formatDuration(pause)} de pausas` : ""}</div>
      </div>
      <p className="note">
        {byVoice
          ? `Mesma conta do Texto em Áudio: ritmo da voz ${voice.name} (${voice.wpm} palavras por minuto) mais as pausas, inclusive o respiro automático entre parágrafos. O ritmo se ajusta sozinho a cada áudio gerado neste aparelho, e o resultado pode variar alguns segundos. Pausas escritas como [PAUSA - 3 segundos] entram na conta.`
          : "É uma estimativa para quem grava a própria voz. Cada pessoa fala num ritmo, então grave um trecho curto e compare. Pausas escritas como [PAUSA - 3 segundos] entram na conta."}
      </p>
    </div>
  );
}
