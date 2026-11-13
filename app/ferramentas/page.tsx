import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import { GROUPS, TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Ferramentas grátis para criadores · texto-áudio",
  description: "Calculadora de tempo de fala, gerador de capítulos e legendas, criador de miniatura e mais. Grátis, sem cadastro e direto no navegador.",
};

export default function Ferramentas() {
  return (
    <Shell>
      <div className="tp">
        <h1>Ferramentas para criadores</h1>
        <p className="lead">Grátis, sem cadastro e sem enviar seus arquivos: tudo roda no seu navegador. Escolha só o que precisar.</p>
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
