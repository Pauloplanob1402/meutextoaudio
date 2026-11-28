"use client";
import { useState } from "react";
import { AREAS, BETA_TOOLS, FORMATS, helpMailto } from "@/lib/talentos";

export default function TalentForm() {
  const [tool, setTool] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [format, setFormat] = useState(FORMATS[2]);
  return (
    <div className="field-group" style={{ display: "grid", gap: 12, maxWidth: 520 }}>
      <div className="field"><label htmlFor="t-tool">Quero ajudar em</label>
        <select id="t-tool" value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value="">O Sauim em geral</option>
          {BETA_TOOLS.map((t) => <option key={t.slug} value={t.title}>{t.title}</option>)}
        </select></div>
      <div className="field"><label htmlFor="t-area">Minha área</label>
        <select id="t-area" value={area} onChange={(e) => setArea(e.target.value)}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
      <div className="field"><label htmlFor="t-fmt">Formato que busco</label>
        <select id="t-fmt" value={format} onChange={(e) => setFormat(e.target.value)}>{FORMATS.map((a) => <option key={a}>{a}</option>)}</select></div>
      <div><a className="btn go" href={helpMailto({ tool, area, format })}>Abrir o e-mail já preenchido</a></div>
      <p className="count">O e-mail abre no seu programa de e-mail, com o título e as 5 perguntas prontos. Este site não guarda nada.</p>
    </div>
  );
}
