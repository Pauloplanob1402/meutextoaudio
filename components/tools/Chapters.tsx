"use client";
import { useMemo, useState } from "react";
import { parseChapters } from "@/lib/toolkit";
import { CopyButton } from "./ui";

const EXAMPLE = "0:00 Introdução\n0:45 Primeiro passo\n2:30 Segundo passo\n4:10 Conclusão";

export default function Chapters() {
  const [raw, setRaw] = useState("");
  const r = useMemo(() => parseChapters(raw), [raw]);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="c">Um capítulo por linha: horário e título</label>
        <textarea id="c" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={EXAMPLE} />
        <button className="link" type="button" onClick={() => setRaw(EXAMPLE)}>Usar um exemplo</button>
      </div>

      {r.items.length > 0 && (
        <div className="result">
          {r.problems.length === 0 ? (
            <p className="count"><b className="ok">Tudo certo.</b> Copie e cole na descrição do vídeo.</p>
          ) : (
            <ul className="problems" aria-live="polite">{r.problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
          )}
          <div className="out" style={{ marginTop: 12 }}>{r.output}</div>
          <div className="rrow" style={{ marginTop: 12 }}><CopyButton text={r.output} /></div>
        </div>
      )}
      <p className="note">Para o YouTube reconhecer os capítulos, o primeiro precisa estar em 0:00, são necessários pelo menos 3, e cada um deve ter ao menos 10 segundos.</p>
    </div>
  );
}
