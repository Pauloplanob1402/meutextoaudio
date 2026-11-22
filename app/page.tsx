import Link from "next/link";
import Tool from "@/components/Tool";
import Arsenal from "@/components/Arsenal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { EXTRAS, PRICE, STAGES, TOTAL, brl, stageCount } from "@/lib/brand";
import { VOICES, voiceNames } from "@/lib/voices";

const BIO = [
  { big: "01", title: "Leve", text: "Cada ferramenta abre rápido no navegador, sem painéis pesados nem menus infinitos." },
  { big: "02", title: "Preciso", text: "Títulos, capítulos, tags e ganchos pensados para prender a atenção nos primeiros segundos." },
  { big: "03", title: "Visão do todo", text: "Simulador de miniatura, contadores e calculadora de ganhos para enxergar o conjunto antes de publicar." },
  { big: "04", title: "Ritmo constante", text: "Calendário de conteúdo e checklist de lançamento para manter a consistência semana após semana." },
];

export default function Home() {
  const price = PRICE.criador;
  const billing = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET && Number(process.env.PRO_PRICE_BRL) > 0);
  return (
    <>
      <SiteHeader home />

      <section className="sa-hero" aria-labelledby="sa-h1">
        <div className="wrap">
          <p className="sa-badge">Ferramentas para criadores de YouTube</p>
          <h1 id="sa-h1">Feito. Subiu. <span>Postado.</span></h1>
          <p className="sa-sub">Roteiro, narração, título e planejamento em um só lugar, para publicar vídeos com constância.</p>
          <div className="sa-actions">
            <a className="btn go" href="#texto-audio">Gerar narração grátis</a>
            <a className="btn ghost" href="#planos">Ver planos</a>
          </div>
        </div>
      </section>

      <div className="wrap" id="texto-audio"><Tool /></div>

      <section id="fluxo" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Como funciona</p>
          <h2>Do roteiro ao vídeo publicado, em 3 etapas.</h2>
          <p className="sa-lead">Crie, publique e mantenha o ritmo.</p>
          <div className="sa-steps">
            {STAGES.map((s) => (
              <Link key={s.id} href={`/ferramentas#${s.id}`} className="sa-step">
                <span className="sa-step-n">{s.n} • {s.tag}</span>
                <small>{s.kicker}</small>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="sa-step-foot"><span>{stageCount(s)} {s.unit}</span><b>Ver etapa →</b></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="ferramentas" className="sa-sec sa-alt">
        <div className="wrap">
          <p className="sa-eyebrow">1 ferramenta principal + {EXTRAS} extras</p>
          <h2>Ferramentas para cada etapa do vídeo.</h2>
          <p className="sa-lead">O Texto em áudio é gratuito. As ferramentas extras fazem parte do plano Criador. Tudo roda no seu navegador, sem enviar seus arquivos.</p>
          <a className="sa-main" href="#texto-audio">
            <div>
              <span className="sa-chip dark">Principal</span>
              <h3>Texto em áudio</h3>
              <p>Cole o roteiro e baixe a narração em MP3 ou WAV, com controle de velocidade e pausas. Duas vozes são gratuitas; as demais fazem parte do plano Criador.</p>
            </div>
            <div className="sa-main-side"><span>MP3 e WAV</span><span>Velocidade e pausas</span><b>Abrir →</b></div>
          </a>
          <Arsenal />
        </div>
      </section>

      <section className="sa-sec">
        <div className="wrap sa-split">
          <div>
            <p className="sa-eyebrow">Imagem • veja antes de publicar</p>
            <h2>Sua miniatura e seu título, no tamanho real do celular.</h2>
            <p className="sa-lead">Compare até 3 títulos com a miniatura, como aparecem no feed do YouTube, antes de publicar.</p>
            <Link className="btn ghost" href="/ferramentas/simulador-de-ctr">Abrir simulador →</Link>
          </div>
          <figure className="sa-phone" aria-label="Exemplo ilustrativo de miniatura e título">
            <div className="sa-thumb"><i>10:24</i><b>FEITO. SUBIU. POSTADO.</b></div>
            <figcaption>
              <strong>Como escalar seu canal do YouTube sem perder horas editando</strong>
              <span>Exemplo ilustrativo</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="biologia" className="sa-sec sa-alt">
        <div className="wrap">
          <p className="sa-eyebrow">Sobre o Sauim</p>
          <h2>Um nome com dois sentidos.</h2>
          <p className="sa-lead">O sauim é um pequeno primata brasileiro, ágil e pouco conhecido, como os canais que estão começando. Lido em voz alta, “sauim” também soa como “sai um”: sai um vídeo, depois outro, e o canal cresce. Dessa brincadeira nasceu o nome, e o site inteiro joga com ela.</p>
          <div className="sa-bio">
            {BIO.map((b) => (
              <div key={b.title}><span aria-hidden="true">{b.big}</span><h3>{b.title}</h3><p>{b.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Planos</p>
          <h2>Escolha o seu plano.</h2>
          <p className="sa-lead">A narração é gerada no seu navegador, sem créditos de áudio. O plano Criador libera as demais vozes e todas as ferramentas.</p>
          <div className="plans sa-plans">
            <div className="plan free">
              <span className="sa-chip">Para começar</span>
              <h3>Grátis</h3>
              <div className="price">R$ 0 <small>/mês</small></div>
              <p className="sa-plan-sub">Sem cadastro e sem cartão.</p>
              <ul>
                <li>Texto em áudio (MP3 e WAV) com as vozes {voiceNames("free")}</li>
                <li>Controle de velocidade e pausas</li>
              </ul>
              <a className="btn ghost" href="#texto-audio">Começar grátis</a>
            </div>
            <div className="plan pro">
              <span className="sa-chip dark">Tudo liberado</span>
              <h3>Criador</h3>
              <div className="price">{brl(price)} <small>/mês</small></div>
              <p className="sa-plan-sub">Todas as vozes e todas as ferramentas.</p>
              <ul>
                <li>Tudo do plano Grátis</li>
                <li>As demais vozes: {voiceNames("pro")}</li>
                <li>Todas as {EXTRAS} ferramentas extras</li>
              </ul>
              {billing ? <Link className="btn" href="/conta">Assinar o plano Criador</Link> : <span className="soon">Assinatura em breve</span>}
            </div>
            <div className="plan studio">
              <span className="sa-chip">Premium</span>
              <h3>Estúdio</h3>
              <div className="price">{brl(PRICE.estudio)} <small>/mês</small></div>
              <p className="sa-plan-sub">Para quem produz em escala.</p>
              <ul>
                <li>Tudo do plano Criador</li>
                <li>Múltiplos perfis de DNA de marca salvos</li>
                <li>Exportação em lote de roteiros, capítulos e .srt</li>
                <li>Calendários editoriais separados por canal</li>
              </ul>
              <span className="soon dim">Em breve</span>
            </div>
          </div>
        </div>
      </section>

      <section id="perguntas" className="sa-sec sa-alt">
        <div className="wrap">
          <h2>Perguntas frequentes</h2>
          <div className="faq">
            <details><summary>Meu texto é enviado para algum servidor?</summary><p>Não. A voz é carregada no seu navegador e o áudio é gerado ali mesmo. O seu texto não sai do seu aparelho.</p></details>
            <details><summary>Por que a primeira geração demora mais?</summary><p>Na primeira vez que você usa uma voz, o navegador baixa o modelo dela (cerca de 60 MB nas vozes rápidas e 90 MB nas vozes naturais) e o mantém salvo. Depois disso, o carregamento é imediato.</p></details>
            <details><summary>Como coloco pausas na narração?</summary><p>Escreva [PAUSA 0.5s] (ou [PAUSA - 3 segundos]) onde quiser o silêncio. O botão “Inserir pausa de 2 segundos” faz isso por você.</p></details>
            <details><summary>Quais vozes estão disponíveis?</summary><p>Há {VOICES.length} vozes em português. {voiceNames("free")} são gratuitas e {voiceNames("pro")} fazem parte do plano Criador. Dora, Alex e Santa são vozes naturais, com geração mais lenta.</p></details>
            <details><summary>Funciona no celular?</summary><p>Funciona, mas pode ser mais lento, principalmente com as vozes naturais. Para textos longos, prefira o computador, com Chrome ou Edge.</p></details>
          </div>
        </div>
      </section>

      <section className="sa-final">
        <div className="wrap">
          <h2>Seu próximo vídeo começa aqui.</h2>
          <p>Comece grátis agora ou libere todas as vozes e ferramentas por {brl(price)}/mês.</p>
          <a className="btn go" href="#texto-audio">Gerar narração grátis</a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
