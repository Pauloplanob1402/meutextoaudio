import Link from "next/link";
import Logo from "./Logo";
import { HeaderCta } from "./PlanCtas";
import PromoBar from "./PromoBar";

// No início (home) os links rolam a página; nas outras páginas levam de volta ao início.
export default function SiteHeader({ home = false }: { home?: boolean }) {
  const h = home ? "" : "/";
  return (
    <>
    <PromoBar />
    <header className="sa-nav">
      <div className="sa-nav-in">
        <Logo />
        <nav aria-label="Principal">
          <a href={`${h}#fluxo`}>Como funciona</a>
          <Link href="/ferramentas">Ferramentas</Link>
          <Link href="/colorir" className="sa-nav-hot">Colorir grátis</Link>
          <Link href="/historia">Nossa história</Link>
          <a href={`${h}#planos`}>Planos</a>
          <Link href="/conta">Conta</Link>
        </nav>
        <HeaderCta href={`${h}#texto-audio`} />
      </div>
    </header>
    </>
  );
}
