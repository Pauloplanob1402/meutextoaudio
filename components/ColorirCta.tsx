import Link from "next/link";
import { TOTAL_PAGINAS } from "@/lib/colorir";

// Bloco de destaque do livro de colorir (home e lista de ferramentas).
export default function ColorirCta({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={"sa-colorir" + (compact ? " compact" : "")} aria-labelledby="co-h">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/colorir/capa.webp" alt="Capa do livro de colorir do Sauim" width={200} height={283} loading="lazy" />
      <div>
        <p className="sa-eyebrow">Grátis para imprimir</p>
        <h2 id="co-h">Livro de colorir do Sauim</h2>
        <p>{TOTAL_PAGINAS} páginas para o seu filho pintar. Baixe, imprima, pinte e poste marcando <b>www.sauim.com.br</b> com <b>#ColoreComOSauim</b>.</p>
        <div className="sa-actions" style={{ justifyContent: "flex-start" }}>
          <a className="btn go" href="/colorir/livro-de-colorir-sauim.pdf" download>Baixar o livro (PDF)</a>
          <Link className="btn ghost" href="/colorir">Ver as {TOTAL_PAGINAS} páginas</Link>
        </div>
      </div>
    </aside>
  );
}
