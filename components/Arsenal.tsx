"use client";
import Link from "next/link";
import { useState } from "react";
import { GROUPS, TOOLS, type GroupId } from "@/lib/tools";
import { GROUP_LABEL } from "@/lib/brand";

// Grade das ferramentas extras com filtro por categoria. Cada cartão abre a ferramenta de verdade.
export default function Arsenal() {
  const [cat, setCat] = useState<GroupId | "todas">("todas");
  const list = TOOLS.map((t, i) => ({ ...t, n: i + 1 })).filter((t) => cat === "todas" || t.group === cat);
  return (
    <>
      <div className="sa-tabs" role="group" aria-label="Filtrar ferramentas">
        <button type="button" className={cat === "todas" ? "on" : ""} aria-pressed={cat === "todas"} onClick={() => setCat("todas")}>Todas ({TOOLS.length})</button>
        {GROUPS.map((g) => (
          <button key={g.id} type="button" className={cat === g.id ? "on" : ""} aria-pressed={cat === g.id} onClick={() => setCat(g.id)}>
            {GROUP_LABEL[g.id]} ({TOOLS.filter((t) => t.group === g.id).length})
          </button>
        ))}
      </div>
      <div className="sa-grid">
        {list.map((t) => (
          <Link key={t.slug} className="sa-tool" href={`/ferramentas/${t.slug}`}>
            <div>
              <div className="sa-tool-top"><span className="sa-chip">{GROUP_LABEL[t.group]}</span><span className="sa-num">#{String(t.n).padStart(2, "0")}</span></div>
              <h3>{t.title}{t.beta && <span className="chip" style={{ marginLeft: 8, fontSize: 12, padding: "1px 8px" }}>beta</span>}</h3>
              <p>{t.short}</p>
            </div>
            <div className="sa-tool-foot"><span>Ferramenta extra</span><b>Abrir →</b></div>
          </Link>
        ))}
      </div>
    </>
  );
}
