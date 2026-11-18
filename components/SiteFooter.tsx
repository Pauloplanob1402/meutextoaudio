import Link from "next/link";
import { Mark } from "./Logo";
import { EXTRAS, TOTAL } from "@/lib/brand";

export default function SiteFooter() {
  return (
    <footer className="sa-foot">
      <div className="wrap sa-foot-in">
        <div>
          <p className="sa-foot-brand"><Mark size={26} /> <b>Saium</b> <span>— Feito. Subiu. Postado.</span></p>
          <p className="sa-foot-note">© 2026 Saium (saium.com.br). Todos os direitos reservados. Feito para criadores de conteúdo do YouTube.</p>
        </div>
        <nav aria-label="Rodapé" className="sa-foot-links">
          <Link href="/#fluxo">Fluxo</Link>
          <Link href="/ferramentas">{TOTAL} Ferramentas</Link>
          <Link href="/#biologia">Biologia</Link>
          <Link href="/#planos">Planos</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
        </nav>
      </div>
    </footer>
  );
}
