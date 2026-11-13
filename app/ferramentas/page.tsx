import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import { GROUPS, TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Ferramentas grátis · texto-áudio",
  description: "Ferramentas simples e grátis para vídeos e textos: tempo de fala, capítulos, legendas, miniatura e mais. Tudo no seu navegador.",
};

export default function Ferramentas() {
  return (
    <Shell>
      <div className="tp">
        <h1>Ferramentas</h1>
        <p className="lead">Grátis e sem cadastro. Tudo funciona no seu navegador. Escolha só o que precisar.</p>
        {GROUPS.map((g) => (
          <div className="group" key={g.id}>
            <h2>{g.title}</h2>
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
      </div>
    </Shell>
  );
}
