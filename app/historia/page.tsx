import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./historia.css";

export const metadata: Metadata = {
  title: "Comece pequeno. Cresça gigante. · SAUIM",
  description: "A história por trás do nome SAUIM: o erro que quase travou o lançamento e por que o importante é sair do zero.",
  openGraph: {
    title: "Comece pequeno. Cresça gigante.",
    description: "A história por trás do nome SAUIM e por que o importante é sair do zero.",
    images: ["/sauim-mascote.jpg"],
    locale: "pt_BR",
    type: "article",
  },
};

// Mesma regra da página inicial: só mostra o caminho de assinatura quando a cobrança está ativa.
const billing = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET && Number(process.env.PRO_PRICE_BRL) > 0);

function Actions() {
  return (
    <div className="hi-actions">
      <Link className="btn go" href="/#texto-audio">Comece seu canal agora</Link>
      <Link className="btn ghost" href={billing ? "/conta" : "/ferramentas"}>Cresça sua ideia agora</Link>
    </div>
  );
}

export default function Historia() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hi-hero" aria-labelledby="hi-h1">
          <div className="wrap">
            <img
              src="/sauim-mascote.jpg"
              width={1264}
              height={843}
              alt="O mascote da SAUIM, um sauim de fones azuis, segura uma placa com SAIUM riscado e SAUIM escrito do jeito certo."
            />
            <h1 id="hi-h1">Comece pequeno. <span>Cresça gigante.</span></h1>
            <p className="hi-sub">A história de um nome que saiu errado e do projeto que saiu mesmo assim.</p>
            <Actions />
          </div>
        </section>

        <article className="hi-story">
          <div className="hi-col">
            <p className="hi-eyebrow">A nossa história</p>
            <h2>O erro que quase travou o lançamento.</h2>
            <p>A gente achava que o nosso maior desafio no começo seria o algoritmo.</p>
            <p><strong>Não foi. Foi o próprio nome.</strong></p>
            <p>Era para ser SAUIM, o macaquinho brasileiro rápido, curioso e ágil que dá nome ao projeto.</p>
            <p>Mas na hora de passar o bastão para colocar o site no ar, veio a dúvida: SAUIM ou SAIUM (de “sai mais um vídeo”)?</p>
            <p>Na pressa, o texto saiu trocado, o domínio foi registrado certinho como SAUIM.COM.BR, mas a primeira versão do site foi ao ar chamando a gente de SAIUM.</p>
            <p>E sabe o que aconteceu?</p>
            <p className="hi-pull">Nada. O mundo não acabou.</p>
            <p>Todo canal que hoje parece grande já publicou um vídeo com áudio ruim, capa duvidosa ou título esquisito no começo.</p>
            <p className="hi-pull">A perfeição trava. O movimento destrava.</p>
            <p>A gente corrigiu a rota, o Sauim assumiu o volante e criamos a plataforma para você errar menos do que a gente no primeiro dia.</p>
            <p>O importante não é começar perfeito. É sair do zero, mesmo que no começo pareça que “saiu um” torto.</p>
          </div>
        </article>

        <section className="hi-end" aria-label="Comece agora">
          <div className="wrap">
            <h2>O seu primeiro vídeo não precisa ser perfeito. Só precisa sair.</h2>
            <Actions />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
