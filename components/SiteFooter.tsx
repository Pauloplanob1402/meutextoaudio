import Link from "next/link";
import { Mark } from "./Logo";
import { EXTRAS, TOTAL } from "@/lib/brand";
import { LEGAL } from "@/lib/legal";

export default function SiteFooter() {
  return (
    <footer className="sa-foot">
      <div className="wrap sa-foot-in">
        <div>
          <p className="sa-foot-brand"><Mark size={26} /> <b>Saium</b> <span>— Feito. Subiu. Postado.</span></p>
          <p className="sa-foot-note">© 2026 Saium. Todos os direitos reservados. Feito por criadores, para criadores.</p>
        </div>
        <nav aria-label="Rodapé" className="sa-foot-links">
          <Link href="/#fluxo">Como funciona</Link>
          <Link href="/ferramentas">{TOTAL} Ferramentas</Link>
          <Link href="/#biologia">Sobre</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <a href={`mailto:${LEGAL.email}`}>Contato</a>
        </nav>
      </div>
    </footer>
  );
}
