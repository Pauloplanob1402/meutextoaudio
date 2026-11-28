"use client";
import { useState } from "react";
import { AREAS, BETA_TOOLS, FORMATS } from "@/lib/talentos";
import HelpMailButtons from "@/components/HelpMailButtons";

export default function TalentForm() {
  const [tool, setTool] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [format, setFormat] = useState(FORMATS[2]);
  return (
    <div className="field-group" style={{ display: "grid", gap: 12, maxWidth: 620 }}>
      <div className="field"><label htmlFor="t-tool">Quero ajudar em</label>
        <select id="t-tool" value={tool} onChange={(e) => setTool(e.target.value)}>
          <option value="">O Sauim em geral</option>
          {BETA_TOOLS.map((t) => <option key={t.slug} value={t.title}>{t.title}</option>)}
        </select></div>
      <div className="field"><label htmlFor="t-area">Minha área</label>
        <select id="t-area" value={area} onChange={(e) => setArea(e.target.value)}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
      <div className="field"><label htmlFor="t-fmt">Formato que busco</label>
        <select id="t-fmt" value={format} onChange={(e) => setFormat(e.target.value)}>{FORMATS.map((a) => <option key={a}>{a}</option>)}</select></div>
      <HelpMailButtons tool={tool} area={area} format={format} />
    </div>
  );
}
