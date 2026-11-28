import Link from "next/link";

// Faixa no topo de todas as páginas: a promoção do livro de colorir.
export default function PromoBar() {
  return (
    <div className="sa-promo">
      <Link href="/colorir"><b>Grátis:</b> livro de colorir do Sauim, 10 páginas para imprimir. <u>Baixe agora →</u></Link>
    </div>
  );
}
