import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LegendaPrototipo from "@/components/prototipos/LegendaPrototipo";

// Página de teste: não aparece em nenhum menu e pede aos buscadores para não indexar.
export const metadata: Metadata = {
  title: "Protótipo: Legenda automática",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <h1>Protótipo: Legenda automática</h1>
        <p className="note">
          Página de teste, fora do site público. Serve para medir o tempo e a qualidade da transcrição neste aparelho. O arquivo não sai do seu computador:
          só o modelo de voz é baixado (na primeira vez) e fica salvo no navegador.
        </p>
        <LegendaPrototipo />
      </main>
      <SiteFooter />
    </>
  );
}
