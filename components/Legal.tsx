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

// A história do Sauim: abre as páginas legais com quem somos e por quê. "children" é o fecho de cada página.
export const Historia = ({ children }: { children: ReactNode }) => (
  <div className="historia">
    <p>O Sauim nasceu entre criadores de conteúdo para o YouTube, gente que conhece de perto o roteiro que não fecha, a narração que falha e a dúvida de quem está começando: “será que alguém vai ver?”</p>
    <p>A origem do nome tem um lado cômico. O <b>sauim</b> é um pequeno primata brasileiro, ágil e pouco conhecido, que vive lá no alto, entre as folhas, e quase ninguém repara. Como os canais que estão começando. Só que, lido em voz alta, “sauim” também soa como <b>“sai um”</b>. E foi daí que veio a brincadeira que virou a identidade do site: cada ferramenta existe para que saia um vídeo. Depois sai mais um. E mais um.</p>
    <p>Todo canal grande começou assim, um vídeo de cada vez. O nosso propósito é ajudar você a levar o seu potencial de criador ao ponto máximo.</p>
    <p>O que segue está escrito do jeito que gostaríamos de ler: claro, direto e sem letras miúdas.</p>
    {children}
  </div>
);

// Convite no fim de cada página legal
export const FacaParte = () => (
  <div className="junte-se">
    <b>Experimente o Sauim</b>
    <p>Cole o seu texto, ouça a narração e conheça as ferramentas para cada etapa do seu vídeo. Sai um vídeo hoje?</p>
    <div className="junte-links">
      <Link href="/">Experimentar grátis</Link>
      <Link href="/ferramentas">Ver as ferramentas</Link>
    </div>
  </div>
);
