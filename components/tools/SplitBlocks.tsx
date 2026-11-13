"use client";
import { useMemo, useState } from "react";
import { splitBlocks } from "@/lib/toolkit";
import { CopyButton, fmtNum } from "./ui";

const SIZES = [500, 1000, 2000, 4000];

export default function SplitBlocks() {
  const [text, setText] = useState("");
  const [max, setMax] = useState(1000);
  const blocks = useMemo(() => splitBlocks(text, max), [text, max]);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="t">Seu texto</label>
        <textarea id="t" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole o texto longo aqui" />
      </div>
      <div className="field">
        <span>Tamanho máximo de cada bloco</span>
        <div className="speeds" role="group" aria-label="Tamanho do bloco">
          {SIZES.map((s) => (
            <button key={s} type="button" className={max === s ? "on" : ""} onClick={() => setMax(s)}>{fmtNum(s)} caracteres</button>
          ))}
        </div>
      </div>
      {blocks.length > 0 && (
        <div className="result">
          <div className="rrow" style={{ justifyContent: "space-between" }}>
            <h2>{blocks.length} {blocks.length === 1 ? "bloco" : "blocos"}</h2>
            <CopyButton text={blocks.join("\n\n")} label="Copiar todos" />
          </div>
          <ol className="blocks">
            {blocks.map((b, i) => (
              <li key={i}>
                <div className="blockhead"><b>Bloco {i + 1}</b><span className="count">{fmtNum(b.length)} caracteres</span><CopyButton text={b} /></div>
                <p>{b}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
      <p className="note">As frases não são cortadas no meio, a não ser que uma única frase seja maior que o limite.</p>
    </div>
  );
}
