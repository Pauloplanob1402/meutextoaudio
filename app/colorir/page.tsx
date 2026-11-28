import Link from "next/link";
import type { Metadata } from "next";
import Shell from "@/components/Shell";
import ShareColor from "@/components/ShareColor";
import { PAGES, TOTAL_PAGINAS } from "@/lib/colorir";
import "./colorir.css";

export const metadata: Metadata = {
  title: "Livro de colorir do Sauim · grátis para imprimir",
  description: `Baixe grátis o livro de colorir do Sauim: ${TOTAL_PAGINAS} páginas para imprimir em casa ou na escola. Peça para seu filho pintar e compartilhe.`,
  openGraph: { title: "Livro de colorir do Sauim", description: `${TOTAL_PAGINAS} páginas grátis para imprimir e pintar.`, images: ["/colorir/capa.webp"], locale: "pt_BR", type: "website" },
};

export default function Colorir() {
  return (
    <Shell>
      <div className="tp">
        <p className="crumb"><Link href="/">← Início</Link></p>
        <h1>Livro de colorir do Sauim</h1>
        <p className="lead">{TOTAL_PAGINAS} páginas grátis para imprimir em casa ou na escola. Sem cadastro. É só baixar, imprimir e entregar os lápis de cor.</p>

        <div className="co-actions">
          <a className="btn go" href="/colorir/livro-de-colorir-sauim.pdf" download>Baixar o livro completo (PDF)</a>
        </div>
        <p className="count">Tamanho A4, em preto e branco, para gastar pouca tinta. Se preferir, baixe só as páginas que quiser abaixo.</p>

        <ul className="co-grid">
          {PAGES.map((p) => (
            <li className="co-card" key={p.file}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/colorir/${p.file}.webp`} alt={`Página para colorir: ${p.title}`} loading="lazy" width={280} height={396} />
              <a href={`/colorir/${p.file}.png`} download={`sauim-${p.file}.png`}>Baixar “{p.title}”</a>
            </li>
          ))}
        </ul>

        <div className="co-box">
          <h2 style={{ marginTop: 0 }}>Quando terminar de pintar, conte para a gente</h2>
          <p>Fotografe o <b>desenho</b> pronto e poste onde você quiser, marcando <b>www.sauim.com.br</b> e <b>#ColoreComOSauim</b>. Assim outras famílias descobrem o livro e o Sauim.</p>
          <ShareColor />
          <p className="count" style={{ marginTop: 10 }}>Cuidado com a criança: poste o desenho, não o rosto dela. Este site não pede nem guarda foto nem dado de criança.</p>
        </div>

        <h2>Tem um canal para crianças?</h2>
        <p>Use as páginas nos seus vídeos e entregue aos seus inscritos, com o link <b>www.sauim.com.br/colorir</b>. E conheça as <Link href="/ferramentas">ferramentas do Sauim</Link> para transformar roteiro em áudio.</p>

        <h2>Como usar</h2>
        <p className="note">Livre para uso pessoal, em casa e em sala de aula, e para criadores que indiquem o Sauim. Não é permitido vender as páginas nem remover o endereço do rodapé.</p>
      </div>
    </Shell>
  );
}
