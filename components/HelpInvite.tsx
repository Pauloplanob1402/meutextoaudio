"use client";
import Link from "next/link";
import { useState } from "react";
import { AREAS } from "@/lib/talentos";
import HelpMailButtons from "@/components/HelpMailButtons";

// Convite no pé de toda ferramenta em beta: quem sabe ajudar escolhe a área e abre um e-mail já com a ferramenta no título.
export default function HelpInvite({ toolTitle }: { toolTitle: string }) {
  const [area, setArea] = useState(AREAS[0]);
  return (
    <aside style={{ marginTop: 28, padding: "16px 18px", border: "1.5px dashed var(--line)", borderRadius: 14 }} aria-labelledby="hi-t">
      <h2 id="hi-t" style={{ fontSize: 20, margin: "0 0 6px" }}>Esta ferramenta ainda está sendo construída. Venha construir junto.</h2>
      <p className="note" style={{ marginTop: 0 }}>
        Mostramos o trabalho enquanto ele acontece. Se você trabalha com software, design, voz ou áudio, ou só sabe o que faria melhor, ajude a aperfeiçoar a <b>{toolTitle}</b>. O e-mail já sai com o nome da ferramenta no título.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <label htmlFor="hi-area">Minha área:</label>
        <select id="hi-area" value={area} onChange={(e) => setArea(e.target.value)}>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 10 }}><HelpMailButtons tool={toolTitle} area={area} primaryLabel="Quero ajudar" /></div>
      <p className="count" style={{ marginTop: 4 }}><Link href="/talentos">Saiba mais</Link></p>
    </aside>
  );
}
