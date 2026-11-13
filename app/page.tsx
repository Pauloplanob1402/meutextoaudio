import Link from "next/link";
import Tool from "@/components/Tool";

export default function Home() {
  return (
    <>
      <div className="wrap">
        <header>
          <a className="logo" href="#topo" aria-label="texto-áudio, início">
            <i aria-hidden="true">{[8, 20, 12, 22, 9].map((h, i) => <b key={i} style={{ height: h }} />)}</i>
            texto-áudio
          </a>
          <nav aria-label="Principal"><Link href="/ferramentas">Ferramentas</Link><a href="#planos">Planos</a><a href="#perguntas">Perguntas</a></nav>
        </header>
        <main id="topo">
          <Tool />
          <p className="more">Precisa de mais? Veja as <Link href="/ferramentas">ferramentas grátis</Link> para título, capítulos, legendas, miniatura e outras coisas.</p>
        </main>
      </div>
<section>
  <div className="wrap">
    <h2>Como funciona</h2>
    <ol className="steps">
      <li><h3>Cole o texto</h3><p>Digite ou cole qualquer texto. Use [PAUSA - 3 segundos] onde quiser um silêncio.</p></li>
      <li><h3>Clique em gerar</h3><p>A voz é criada no seu aparelho. Textos longos são divididos em trechos automaticamente.</p></li>
      <li><h3>Ouça e baixe</h3><p>Ajuste a velocidade, ouça na hora e baixe o arquivo já com as pausas.</p></li>
    </ol>
  </div>
</section>

<section>
  <div className="wrap">
    <h2>Pensado para quem narra em português</h2>
    <div className="why">
      <div><h3>Privacidade de verdade</h3><p>O áudio é gerado no seu navegador. Seu texto não é enviado para servidor nenhum.</p></div>
      <div><h3>Pausas que você controla</h3><p>Marque o silêncio exato entre as frases. Útil para devocionais, aulas e vídeos.</p></div>
      <div><h3>Sem cadastro para começar</h3><p>Abra, cole e ouça. A conta só entra se você quiser salvar o histórico.</p></div>
      <div><h3>Voz em português do Brasil</h3><p>Boa para narração simples. Para vozes mais expressivas, o plano Pro terá opções premium.</p></div>
    </div>
  </div>
</section>

<section id="planos">
  <div className="wrap">
    <h2>Comece de graça</h2>
    <p className="sub">Você só paga se quiser algo a mais.</p>
    
    <div className="plans">
      <div className="plan free">
        <h3>Grátis</h3>
        <div className="price">R$ 0</div>
        <ul>
          <li>Geração no seu navegador</li>
          <li>Voz em português do Brasil</li>
          <li>Pausas e controle de velocidade</li>
          <li>Download em MP3 ou WAV</li>
        </ul>
        <a className="btn" href="#topo">Gerar meu áudio grátis</a>
      </div>
      <div className="plan pro">
        <h3>Pro</h3>
        <div className="price">Em breve</div>
        <ul>
          <li>Tudo do plano Grátis</li>
          <li>Histórico salvo na nuvem</li>
          <li>Textos mais longos e projetos</li>
          <li>Vozes premium</li>
        </ul>
        <span className="soon">Ainda não disponível</span>
      </div>
    </div>
  </div>
</section>

<section id="perguntas">
  <div className="wrap">
    <h2>Perguntas frequentes</h2>
    <div className="faq">
      <details><summary>Meu texto é enviado para algum servidor?</summary><p>Não. A voz é baixada para o seu navegador e o áudio é gerado ali mesmo. O texto não sai do seu aparelho.</p></details>
      <details><summary>Por que a primeira geração demora mais?</summary><p>Na primeira vez, o navegador baixa o modelo da voz (uns 60 MB) e guarda para os próximos usos.</p></details>
      <details><summary>Funciona no celular?</summary><p>Funciona, mas pode ser mais lento, e textos muito longos são mais seguros no computador, em Chrome ou Edge.</p></details>
    </div>
  </div>
</section>

<div className="wrap">
  <footer>
    <span>© 2026 texto-áudio</span>
    <Link href="/ferramentas">Ferramentas</Link>
    </footer>
</div>
    </>
  );
}
