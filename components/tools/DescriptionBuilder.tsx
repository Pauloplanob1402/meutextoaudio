"use client";
import { useState } from "react";
import { parseChapters } from "@/lib/toolkit";
import { DEFAULT_CTA, buildDescription, normHashtags, type DescInput } from "@/lib/sistema2";
import { CopyButton, useStored } from "./ui";

const EMPTY: DescInput = { resumo: "", pontos: "", cta: DEFAULT_CTA, capitulos: "", links: "", sobre: "", hashtags: "" };

export default function DescriptionBuilder() {
  const [f, setF] = useStored<DescInput>("descricao-modelo", EMPTY);
  const [kw, setKw] = useState("");
  const out = buildDescription(f);
  const set = (k: keyof DescInput, v: string) => setF({ ...f, [k]: v });
  const ch = f.capitulos.trim() ? parseChapters(f.capitulos) : null;
  const first = f.resumo.trim().slice(0, 150);
  const kwMissing = kw.trim() && !f.resumo.toLowerCase().includes(kw.trim().toLowerCase());
  const tags = normHashtags(f.hashtags);

  return (
    <div className="tool">
      <div className="field">
        <label htmlFor="d-r">Resumo (as primeiras linhas)</label>
        <span className="count">Só o começo aparece antes do “mostrar mais”. Diga o que a pessoa vai ver e coloque a palavra-chave logo.</span>
        <textarea id="d-r" value={f.resumo} onChange={(e) => set("resumo", e.target.value)} style={{ minHeight: 90 }} placeholder="Ex.: Aprenda a transformar texto em áudio em português em 1 minuto, sem programa e sem cadastro." />
        <span className="count"><b className={f.resumo.length > 150 ? "warn" : ""}>{f.resumo.length}</b> caracteres · aparece antes do “mostrar mais”: cerca de {first.length}</span>
        <input type="text" value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Palavra-chave para conferir (opcional)" aria-label="Palavra-chave" />
        {kwMissing && <span className="count"><b className="warn">A palavra-chave não está no resumo.</b></span>}
      </div>
      <div className="field"><label htmlFor="d-p">O que a pessoa vai ver (um item por linha)</label><textarea id="d-p" value={f.pontos} onChange={(e) => set("pontos", e.target.value)} style={{ minHeight: 90 }} /></div>
      <div className="field"><label htmlFor="d-c">Convite para curtir e se inscrever</label><textarea id="d-c" value={f.cta} onChange={(e) => set("cta", e.target.value)} style={{ minHeight: 70 }} /></div>
      <div className="field">
        <label htmlFor="d-ch">Capítulos</label>
        <textarea id="d-ch" value={f.capitulos} onChange={(e) => set("capitulos", e.target.value)} style={{ minHeight: 100 }} placeholder={"0:00 Começo\n0:30 Primeiro passo\n2:10 Segundo passo"} />
        {ch && ch.problems.length > 0 && <ul className="problems">{ch.problems.slice(0, 3).map((p) => <li key={p}>{p}</li>)}</ul>}
      </div>
      <div className="field"><label htmlFor="d-l">Links</label><textarea id="d-l" value={f.links} onChange={(e) => set("links", e.target.value)} style={{ minHeight: 80 }} placeholder={"Site: https://...\nInstagram: https://..."} /></div>
      <div className="field"><label htmlFor="d-s">Sobre o canal (fica salvo para os próximos vídeos)</label><textarea id="d-s" value={f.sobre} onChange={(e) => set("sobre", e.target.value)} style={{ minHeight: 70 }} /></div>
      <div className="field"><label htmlFor="d-h">Hashtags, separadas por vírgula (as 3 primeiras aparecem acima do título)</label><input id="d-h" type="text" value={f.hashtags} onChange={(e) => set("hashtags", e.target.value)} placeholder="criadores, youtube, texto em áudio" />{tags.length > 0 && <span className="count">Ficam assim: {tags.join(" ")}</span>}</div>

      <h2 className="steph">Descrição pronta</h2>
      <div className="out">{out || "Preencha o resumo para ver a descrição."}</div>
      <p className="count"><b className={out.length > 5000 ? "bad" : ""}>{out.length}</b> de 5.000 caracteres</p>
      <div className="rrow">
        <CopyButton text={out} label="Copiar descrição" disabled={!out} />
        <button className="btn ghost" type="button" onClick={() => setF({ ...EMPTY, sobre: f.sobre, cta: f.cta })}>Novo vídeo (guarda o “sobre” e o convite)</button>
      </div>
      <p className="note">Fica salvo só neste aparelho. O limite de 5.000 caracteres é do YouTube.</p>
    </div>
  );
}
