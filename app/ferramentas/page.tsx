import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import { GROUPS, TOOLS } from "@/lib/tools";
import { STAGES, TOTAL, stageCount } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Ferramentas para criadores de YouTube · Saium",
  description: "Texto em áudio, gerador de capítulos e legendas, criador de miniatura e mais. Grátis, sem cadastro e direto no navegador.",
};

export default function Ferramentas() {
  return (
    <Shell>
      <div className="tp">
        <h1>O arsenal completo para criadores</h1>
        <p className="lead">{TOTAL} ferramentas em 3 etapas: Feito, Subiu, Postado. Grátis para testar, sem enviar seus arquivos: tudo roda no seu navegador.</p>
        <p className="sa-jump">
          {STAGES.map((s) => <a key={s.id} href={`#${s.id}`}>{s.n} • {s.tag}</a>)}
        </p>
        {STAGES.map((s) => (
          <section className="sa-stage" id={s.id} key={s.id}>
            <p className="sa-eyebrow">{s.n} • {s.tag} • {stageCount(s)} {s.unit}</p>
            <h2 className="sa-stage-h">{s.title}</h2>
            <p className="sa-lead">{s.text}</p>
            {s.id === "feito" && (
              <Link className="sa-main" href="/#texto-audio">
                <div>
                  <span className="sa-chip dark">Principal • 100% ilimitado</span>
                  <h3>Texto em áudio</h3>
                  <p>Cole o roteiro e baixe a narração em MP3 ou WAV, com velocidade e pausas sob medida.</p>
                </div>
                <div className="sa-main-side"><b>Abrir →</b></div>
              </Link>
            )}
            {GROUPS.filter((g) => s.groups.includes(g.id)).map((g) => (
              <div className="group" key={g.id}>
                <h3 className="sa-group-h">{g.title}</h3>
                <p>{g.hint}</p>
                <div className="cards">
                  {TOOLS.filter((t) => t.group === g.id).map((t) => (
                    <Link className="tcard" href={`/ferramentas/${t.slug}`} key={t.slug}>
                      {t.start && <span className="badge">Bom para começar</span>}
                      <h3>{t.title}</h3>
                      <p>{t.short}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </Shell>
  );
}
