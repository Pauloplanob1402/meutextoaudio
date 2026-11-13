"use client";
import { useState } from "react";
import { fmtNum } from "./ui";

const TITLE_MAX = 100;
const DESC_MAX = 5000;

function level(n: number, good: number, max: number) {
  return n > max ? "bad" : n > good ? "warn" : "ok";
}

export default function TitleCounter() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const tl = level(title.length, 60, TITLE_MAX);
  const dl = level(desc.length, 4500, DESC_MAX);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="ti">Título do vídeo</label>
        <input id="ti" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Como transformar texto em áudio" />
        <span className="count">
          <b className={tl}>{title.length}</b> de {TITLE_MAX} caracteres
          {title.length > 60 && title.length <= TITLE_MAX ? " · títulos acima de ~60 costumam aparecer cortados" : ""}
          {title.length > TITLE_MAX ? " · passou do limite do YouTube" : ""}
        </span>
      </div>

      <div className="field">
        <span>Como pode aparecer</span>
        <div className="yt" aria-label="Prévia do título">
          <div className="yt-thumb" aria-hidden="true" />
          <div className="yt-info">
            <div className="yt-title">{title || "Seu título aparece aqui"}</div>
            <div className="yt-meta">Seu canal · 1,2 mil visualizações</div>
          </div>
        </div>
        <span className="count">O YouTube corta títulos longos de acordo com a tela de quem assiste. Esta prévia é só uma referência.</span>
      </div>

      <div className="field">
        <label htmlFor="de">Descrição</label>
        <textarea id="de" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Escreva a descrição do vídeo" />
        <span className="count">
          <b className={dl}>{fmtNum(desc.length)}</b> de {fmtNum(DESC_MAX)} caracteres
          {desc.length > 0 && desc.length <= 150 ? "" : desc.length > 150 ? " · só o começo (cerca de 150 caracteres) costuma aparecer antes do “mais”" : ""}
        </span>
      </div>
      <p className="note">Dica: coloque a informação mais importante no começo do título e da descrição.</p>
    </div>
  );
}
