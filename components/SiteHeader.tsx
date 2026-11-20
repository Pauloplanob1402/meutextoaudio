import Link from "next/link";
import Logo from "./Logo";

// No início (home) os links rolam a página; nas outras páginas levam de volta ao início.
export default function SiteHeader({ home = false }: { home?: boolean }) {
  const h = home ? "" : "/";
  return (
    <header className="sa-nav">
      <div className="sa-nav-in">
        <Logo />
        <nav aria-label="Principal">
          <a href={`${h}#fluxo`}>Como funciona</a>
          <Link href="/ferramentas">Ferramentas</Link>
          <a href={`${h}#biologia`}>Sobre</a>
          <a href={`${h}#planos`}>Planos</a>
          <Link href="/conta">Conta</Link>
        </nav>
        <a className="sa-cta" href={`${h}#texto-audio`}>Começar grátis</a>
      </div>
    </header>
  );
}
