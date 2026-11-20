import Link from "next/link";
import type { ReactNode } from "react";
import Shell from "@/components/Shell";
import { ATUALIZADO_EM, LEGAL, camposPendentes } from "@/lib/legal";

// Moldura das páginas legais: título, aviso de campos pendentes, índice e conteúdo.
export function LegalPage({ title, intro, toc, children }: { title: string; intro: string; toc: { id: string; title: string }[]; children: ReactNode }) {
  const faltam = camposPendentes();
  return (
    <Shell>
      <div className="tp legal">
        <h1>{title}</h1>
        <p className="lead">{intro}</p>
        <p className="count">Atualizado em {ATUALIZADO_EM}</p>
        {faltam.length > 0 && (
          <p className="aviso" role="alert">
            <b>Aviso para o dono do site:</b> ainda há {faltam.length} {faltam.length === 1 ? "campo" : "campos"} [PREENCHER] em <code>lib/legal.ts</code>. Preencha antes de divulgar esta página.
          </p>
        )}
        {children}
        <nav className="toc" aria-label="Nesta página">
          <b>Nesta página</b>
          <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.title}</a></li>)}</ol>
        </nav>
      </div>
    </Shell>
  );
}

export const Resumo = ({ children }: { children: ReactNode }) => <div className="resumo"><b>Em resumo</b>{children}</div>;

// Um bloco numerado da página (usa div, porque <section> tem estilo próprio no site)
export const Sec = ({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) => (
  <div className="sec" id={id}>
    <h2>{n}. {title}</h2>
    {children}
  </div>
);

export function Email() {
  return LEGAL.email.includes("[PREENCHER") ? <>{LEGAL.email}</> : <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>;
}

export const OutraPagina = ({ href, children }: { href: string; children: ReactNode }) => <Link href={href}>{children}</Link>;

// A história do Saium: abre as páginas legais com quem somos e por quê. "children" é o fecho de cada página.
export const Historia = ({ children }: { children: ReactNode }) => (
  <div className="historia">
    <p>O Saium nasceu entre criadores. Somos inquietos: gente que ama produzir conteúdo para o YouTube e que fez da programação e do próprio YouTube a sua paixão. Conhecemos de perto o roteiro que não fecha, a voz que falha, a miniatura que não convence e aquela dúvida de madrugada: “será que alguém vai ver?”</p>
    <p>Foi por causa dessa dúvida que escolhemos o <b>sauim</b>. Ele é um primata pequeno, pouco conhecido, pouco falado, que vive lá no alto, entre as folhas, e quase ninguém repara. Mas é ágil, esperto e está sempre em movimento. Assim são os canais que começam: pequenos, ainda pouco falados, cheios de vida.</p>
    <p>O nome tem dois sentidos, e a gente gosta dos dois. Um é o sauim. O outro é o <b>“sai um”</b>: sai um vídeo aqui de alguém que está começando. Sai mais um. Sai mais um. Sai um. É assim que todo canal grande começa, um vídeo de cada vez, e é para esses vídeos que o Saium existe.</p>
    <p>Nosso propósito é ajudar você a levar o seu potencial de criador ao ponto máximo. Nesta história, o herói é você. O Saium é o guia que segura a lanterna: dá a voz, as ferramentas e o caminho para o seu canal sair do chão e chegar ao topo das árvores.</p>
    <p>E como cada dado que passa por aqui faz parte da sua jornada, escrevemos o que segue do jeito que gostaríamos de ler: claro, direto e sem letras miúdas.</p>
    {children}
  </div>
);

// Convite para fazer parte, no fim de cada página legal
export const FacaParte = () => (
  <div className="junte-se">
    <b>Faça parte do topo da copa</b>
    <p>Todo canal grande já foi pequeno. Se você também é inquieto como a gente, cole o seu texto, ouça a sua narração e veja o que acontece quando o seu vídeo ganha voz. Estamos construindo o Saium junto com criadores como você, e há lugar para o seu canal.</p>
    <div className="junte-links">
      <Link href="/">Experimentar grátis</Link>
      <Link href="/ferramentas">Ver as ferramentas</Link>
    </div>
  </div>
);
