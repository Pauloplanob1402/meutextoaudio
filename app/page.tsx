import Link from "next/link";
import Tool from "@/components/Tool";
import Arsenal from "@/components/Arsenal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { EXTRAS, PRICE, STAGES, TOTAL, brl, stageCount } from "@/lib/brand";

const BIO = [
  { big: "01", title: "Leve", text: "Sem painéis pesados nem menus infinitos. Cada ferramenta abre rápido no navegador, para você executar e seguir." },
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
          <p className="sa-badge">Texto em áudio sem limite nos planos pagos • a partir de {brl(price)}/mês</p>
          <h1 id="sa-h1">Feito. Subiu. <span>Postado.</span></h1>
          <p className="sa-sub">Do roteiro à narração, do título ao upload: tudo o que o seu canal precisa para publicar um vídeo atrás do outro.</p>
          <div className="sa-actions">
            <a className="btn go" href="#texto-audio">Gerar narração grátis</a>
            <a className="btn ghost" href="#planos">Ver planos a partir de {brl(price)}</a>
          </div>
        </div>
      </section>

      <div className="wrap" id="texto-audio"><Tool /></div>

      <section id="fluxo" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Como funciona</p>
          <h2>Do rascunho ao topo em 3 etapas.</h2>
          <p className="sa-lead">Primeiro você cria. Depois publica com cuidado. Por fim, acompanha os resultados e mantém o ritmo.</p>
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
          <h2>Todas as ferramentas do seu canal.</h2>
          <p className="sa-lead">Abra qualquer ferramenta e use na hora. Tudo roda no seu navegador, sem enviar seus arquivos.</p>
          <a className="sa-main" href="#texto-audio">
            <div>
              <span className="sa-chip dark">Principal • sem limite nos planos pagos</span>
              <h3>Texto em áudio</h3>
              <p>Cole o roteiro e baixe a narração em MP3 ou WAV, com velocidade e pausas sob medida. Sem limite de uso nos planos a partir de {brl(price)}/mês.</p>
            </div>
            <div className="sa-main-side"><span>Sem limite nos planos pagos</span><span>Velocidade e pausas</span><b>Abrir →</b></div>
          </a>
          <Arsenal />
        </div>
      </section>

      <section className="sa-sec">
        <div className="wrap sa-split">
          <div>
            <p className="sa-eyebrow">Imagem • veja antes de publicar</p>
            <h2>Sua miniatura e seu título, no tamanho real do celular.</h2>
            <p className="sa-lead">Compare até 3 títulos com a capa lado a lado, no feed do YouTube, antes de apertar em publicar.</p>
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
          <p className="sa-eyebrow">Por que Saium?</p>
          <h2>Um nome com dois sentidos e um propósito.</h2>
          <p className="sa-lead">O sauim é um pequeno primata brasileiro: pouco conhecido, pouco falado, ágil lá no alto das árvores. Como os canais que estão começando. E “sai um” é o que acontece quando alguém decide publicar: sai um vídeo, sai mais um, e o canal cresce. O Saium nasceu entre criadores inquietos para ajudar você a levar o seu potencial ao ponto máximo.</p>
          <div className="sa-bio">
            {BIO.map((b) => (
              <div key={b.title}><span aria-hidden="true">{b.big}</span><h3>{b.title}</h3><p>{b.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Texto em áudio sem limite a partir de {brl(price)}/mês</p>
          <h2>Escolha o plano para o tamanho do seu canal.</h2>
          <p className="sa-lead">A narração é gerada no seu navegador: nos planos pagos, não há créditos de áudio para contar.</p>
          <div className="plans sa-plans">
            <div className="plan free">
              <span className="sa-chip">Para começar</span>
              <h3>Grátis</h3>
              <div className="price">R$ 0 <small>/mês</small></div>
              <p className="sa-plan-sub">Experimente o Saium direto no navegador, sem cadastrar cartão.</p>
              <ul>
                <li>Texto em áudio (MP3 e WAV), com limite de gerações</li>
                <li>Ferramentas extras de roteiro, título e publicação</li>
                <li>Simulador de miniatura e contador de título</li>
              </ul>
              <a className="btn ghost" href="#texto-audio">Começar grátis</a>
            </div>
            <div className="plan pro">
              <span className="sa-chip dark">Texto em áudio sem limite</span>
              <h3>Criador</h3>
              <div className="price">{brl(price)} <small>/mês</small></div>
              <p className="sa-plan-sub">Tudo o que você precisa para produzir e publicar vídeos, sem limite de narrações.</p>
              <ul>
                <li>Texto em áudio sem limite de gerações (MP3 e WAV)</li>
                <li>Controle de velocidade e pausas</li>
                <li>Acesso às {EXTRAS} ferramentas extras</li>
                <li>Removedor de silêncio, legendas .srt e criador de miniatura</li>
              </ul>
              {billing ? <Link className="btn" href="/conta">Assinar o plano Criador</Link> : <span className="soon">Assinatura em breve</span>}
            </div>
            <div className="plan studio">
              <span className="sa-chip">Premium • vozes mais naturais</span>
              <h3>Estúdio</h3>
              <div className="price">{brl(PRICE.estudio)} <small>/mês</small></div>
              <p className="sa-plan-sub">Para quem quer a narração mais natural possível e produz em escala.</p>
              <ul>
                <li>Tudo do plano Criador</li>
                <li>Mais vozes naturais para escolher</li>
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
            <details><summary>Por que a primeira geração demora mais?</summary><p>Na primeira vez, o navegador carrega o modelo da voz (cerca de 60 MB) e o mantém salvo. Por isso, as gerações seguintes são imediatas.</p></details>
            <details><summary>Como coloco pausas na narração?</summary><p>Escreva [PAUSA 0.5s] (ou [PAUSA - 3 segundos]) onde quiser o silêncio. O botão “Inserir pausa” faz isso por você.</p></details>
            <details><summary>Funciona no celular?</summary><p>Funciona, mas pode ser mais lento, e textos muito longos são mais seguros no computador, em Chrome ou Edge.</p></details>
          </div>
        </div>
      </section>

      <section className="sa-final">
        <div className="wrap">
          <h2>Seu próximo vídeo começa aqui.</h2>
          <p>Comece grátis agora ou libere narração sem limite e todas as {EXTRAS} ferramentas extras por {brl(price)}/mês.</p>
          <a className="btn go" href="#texto-audio">Gerar minha narração ↑</a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
