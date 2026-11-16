import Link from "next/link";
import type { ReactNode } from "react";

// Cabeçalho e rodapé das páginas de ferramentas
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="wrap">
      <header>
        <Link className="logo" href="/" aria-label="texto-áudio, início">
          <i aria-hidden="true">{[8, 20, 12, 22, 9].map((h, i) => <b key={i} style={{ height: h }} />)}</i>
          texto-áudio
        </Link>
        <nav aria-label="Principal">
          <Link href="/">Início</Link>
          <Link href="/ferramentas">Ferramentas</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <span>© 2026 texto-áudio</span>
        <Link href="/">Voltar ao texto para áudio</Link>
      </footer>
    </div>
  );
}
