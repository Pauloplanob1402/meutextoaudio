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
