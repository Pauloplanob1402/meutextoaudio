"use client";
import { useEffect, useState } from "react";
import { blockStatus, SCRIPT_BLOCKS } from "@/lib/toolkit2";
import { fmtTime, speechSeconds } from "@/lib/toolkit";
import { formatDuration, savedNarrationWpm } from "@/lib/tts";
import { CopyButton, downloadText, fmtNum, useStored } from "./ui";

const PACES = [
  { label: "Calmo", wpm: 120 },
  { label: "Normal", wpm: 150 },
  { label: "Rápido", wpm: 180 },
];

export default function ScriptBlocks() {
  const [texts, setTexts] = useStored<Record<string, string>>("roteiro-blocos", {});
  const [wpm, setWpm] = useState(150);
  const [pace, setPace] = useState("Normal");
  const [nar, setNar] = useState(0); // ritmo real da voz do Sauim neste aparelho (0 até carregar)
  useEffect(() => { setNar(savedNarrationWpm()); }, []);
  const paces = nar ? [...PACES, { label: "Narração do Sauim", wpm: nar }] : PACES;
  const calc = SCRIPT_BLOCKS.map((b) => speechSeconds(texts[b.id] ?? "", wpm));
  const total = calc.reduce((s, c) => s + c.seconds, 0);
  const words = calc.reduce((s, c) => s + c.words, 0);

  let t = 0;
  const starts = calc.map((c) => { const s = t; t += c.seconds; return s; });

  const full = SCRIPT_BLOCKS.map((b, i) => `[${b.title.toUpperCase()} · começa em ${fmtTime(starts[i])}]\n${(texts[b.id] ?? "").trim()}`).join("\n\n");

  return (
    <div className="tool">
      <div className="field">
        <span>Ritmo da fala</span>
        <div className="speeds" role="group" aria-label="Ritmo da fala">
          {paces.map((p) => (
            <button key={p.label} type="button" className={pace === p.label ? "on" : ""} onClick={() => { setWpm(p.wpm); setPace(p.label); }}>{p.label} ({p.wpm} palavras por minuto)</button>
          ))}
        </div>
      </div>

      <ol className="blocks scriptblocks">
        {SCRIPT_BLOCKS.map((b, i) => {
          const c = calc[i];
          const st = blockStatus(b, c.seconds, c.words);
          return (
            <li key={b.id}>
              <div className="blockhead">
                <h3>{i + 1}. {b.title}</h3>
                <span className="count">{b.range}{c.words ? ` · começa em ${fmtTime(starts[i])}` : ""}</span>
              </div>
              <p className="count" style={{ margin: "6px 0 8px" }}>{b.hint}</p>
              <textarea aria-label={b.title} value={texts[b.id] ?? ""} onChange={(e) => setTexts({ ...texts, [b.id]: e.target.value })} placeholder={b.placeholder} />
              <p className="count"><b className={st.kind === "ok" ? "ok" : st.kind === "empty" ? "" : "warn"}>{c.words ? formatDuration(c.seconds) : "0 s"}</b> · {fmtNum(c.words)} palavras{st.msg ? ` · ${st.msg}` : ""}</p>
            </li>
          );
        })}
      </ol>

      <div className="big-out" aria-live="polite">
        <div className="num">{words ? formatDuration(total) : "0 s"}</div>
        <div className="count">duração total estimada · {fmtNum(words)} palavras</div>
      </div>
      <div className="rrow">
        <CopyButton text={full} label="Copiar roteiro" disabled={!words} />
        <button className="btn ghost" type="button" onClick={() => downloadText(full, "roteiro.txt")} disabled={!words}>Baixar .txt</button>
        <button className="btn ghost" type="button" onClick={() => setTexts({})} disabled={!words}>Limpar tudo</button>
      </div>
      <p className="note">Pausas escritas como [PAUSA - 3 segundos] entram na conta. Cada bloco mostra se está curto ou longo para a função dele. Fica salvo só neste aparelho.</p>
    </div>
  );
}
