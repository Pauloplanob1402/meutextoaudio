import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import { GROUPS, TOOLS } from "@/lib/tools";
import { STAGES, TOTAL, stageCount } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Ferramentas para criadores de YouTube · Sauim",
  description: "Texto em áudio, gerador de capítulos e legendas, criador de miniatura e mais. Direto no navegador, sem enviar seus arquivos.",
};

export default function Ferramentas() {
  return (
    <Shell>
      <div className="tp">
        <h1>Todas as ferramentas para criadores</h1>
        <p className="lead">{TOTAL} ferramentas em 3 etapas: Feito, Subiu, Postado. Tudo roda no seu navegador, sem enviar seus arquivos. O Texto em áudio é gratuito; as demais fazem parte do plano Criador.</p>
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
                  <span className="sa-chip dark">Principal</span>
                  <h3>Texto em áudio</h3>
                  <p>Cole o roteiro e baixe a narração em MP3 ou WAV, com controle de velocidade e pausas.</p>
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
                      <h3>{t.title}{t.beta && <span className="chip" style={{ marginLeft: 8, fontSize: 12, padding: "1px 8px" }}>beta</span>}</h3>
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
