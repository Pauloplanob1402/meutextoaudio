"use client";
import { useMemo, useState } from "react";
import { makeHashtags, makeTags, tagsLength } from "@/lib/toolkit";
import { CopyButton } from "./ui";

export default function Hashtags() {
  const [input, setInput] = useState("");
  const [noAccents, setNoAccents] = useState(false);
  const tags = useMemo(() => makeTags(input), [input]);
  const hashtags = useMemo(() => makeHashtags(input, { noAccents }), [input, noAccents]);
  const tagsText = tags.join(", ");
  const len = tagsLength(tags);
  const hashText = hashtags.join(" ");

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="k">Palavras-chave do vídeo</label>
        <textarea id="k" value={input} onChange={(e) => setInput(e.target.value)} placeholder={"Separe por vírgula ou por linha.\nEx.: texto para áudio, narração, voz em português"} />
      </div>

      <div className="result">
        <h2>Hashtags</h2>
        <div className="out" aria-live="polite">{hashText || "As hashtags aparecem aqui."}</div>
        <div className="rrow" style={{ marginTop: 12 }}>
          <CopyButton text={hashText} />
          <label className="inline"><input type="checkbox" checked={noAccents} onChange={(e) => setNoAccents(e.target.checked)} /> Tirar os acentos</label>
        </div>
        <p className="note">O YouTube mostra as 3 primeiras acima do título. Com mais de 15 hashtags, ele ignora todas.{hashtags.length > 15 ? " Você passou de 15." : ""}</p>
      </div>

      <div className="result">
        <h2>Tags</h2>
        <div className="out" aria-live="polite">{tagsText || "As tags aparecem aqui."}</div>
        <div className="rrow" style={{ marginTop: 12 }}>
          <CopyButton text={tagsText} />
          <span className="count"><b className={len > 500 ? "bad" : "ok"}>{len}</b> de 500 caracteres</span>
        </div>
        <p className="note">As tags ajudam pouco, mas ajudam quando a palavra costuma ser escrita errada ou sem acento. Por isso a versão sem acento também é incluída.</p>
      </div>
    </div>
  );
}
