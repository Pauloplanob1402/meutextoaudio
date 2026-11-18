import Link from "next/link";
import Tool from "@/components/Tool";
import Arsenal from "@/components/Arsenal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { EXTRAS, PRICE, STAGES, TOTAL, brl, stageCount } from "@/lib/brand";

const BIO = [
  { big: "300g", title: "300g de leveza", text: "Sem painéis pesados ou menus infinitos. Cada ferramenta abre rápido no navegador para você executar e seguir." },
  { big: "🐾", title: "Garras de aderência", text: "SEO, capítulos, tags e ganchos que agarram a atenção nos primeiros segundos e escalam o algoritmo sem escorregar." },
  { big: "👁", title: "Visão panorâmica", text: "Simulador de miniatura, contadores precisos e calculadora de ganhos para enxergar o todo lá do topo antes de publicar." },
  { big: "☀", title: "Ritmo diurno constante", text: "Calendário de conteúdo e checklist de lançamento para manter consistência semanal sem travar na frente da tela." },
];

export default function Home() {
  const price = PRICE.criador;
  const billing = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_WEBHOOK_SECRET && Number(process.env.PRO_PRICE_BRL) > 0);
  return (
    <>
      <SiteHeader home />

      <section className="sa-hero" aria-labelledby="sa-h1">
        <div className="wrap">
          <p className="sa-badge">Texto em Áudio ilimitado direto no site • a partir de {brl(price)}/mês</p>
          <h1 id="sa-h1">Feito. Subiu. <span>Postado.</span></h1>
          <p className="sa-sub">Criação pronta antes de abrir o YouTube Studio, upload sem atrito e seu vídeo no ar com a agilidade de um sauim no topo das árvores.</p>
          <div className="sa-actions">
            <a className="btn go" href="#texto-audio">Testar Texto em Áudio grátis</a>
            <a className="btn ghost" href="#planos">Ver planos a partir de {brl(price)}</a>
          </div>
        </div>
      </section>

      <div className="wrap" id="texto-audio"><Tool /></div>

      <section id="fluxo" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Jornada cronológica do criador</p>
          <h2>Do rascunho ao topo em 3 etapas.</h2>
          <p className="sa-lead">Primeiro você resolve toda a criação. Depois sobe com precisão técnica. Por fim, coloca no ar e acompanha do alto da árvore.</p>
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
          <p className="sa-eyebrow">1 Principal + {EXTRAS} Extras</p>
          <h2>O arsenal completo para criadores.</h2>
          <p className="sa-lead">Clique em qualquer ferramenta para abrir e usar na hora. Tudo roda no seu navegador.</p>
          <a className="sa-main" href="#texto-audio">
            <div>
              <span className="sa-chip dark">Principal • 100% ilimitado</span>
              <h3>Texto em áudio</h3>
              <p>Roda direto no seu navegador, sem limite de minutos ou caracteres nos planos a partir de {brl(price)}/mês. Exporte em MP3 e WAV com velocidade e pausas sob medida.</p>
            </div>
            <div className="sa-main-side"><span>Sem limite de uso</span><span>Velocidade e pausas</span><b>Testar →</b></div>
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
          <h2>A biologia do pequeno primata aplicada ao crescimento no YouTube.</h2>
          <p className="sa-lead">O sauim é um pequeno primata brasileiro que cruza o topo das árvores sem tocar o chão. Trouxemos suas quatro vantagens evolutivas para substituir ferramentas lentas e cheias de atrito.</p>
          <div className="sa-bio">
            {BIO.map((b) => (
              <div key={b.title}><span aria-hidden="true">{b.big}</span><h3>{b.title}</h3><p>{b.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="sa-sec">
        <div className="wrap">
          <p className="sa-eyebrow">Texto em Áudio 100% ilimitado a partir de {brl(price)}/mês</p>
          <h2>Escolha o ritmo da sua escalada.</h2>
          <p className="sa-lead">Como a síntese roda direto no site, você nunca fica travado por créditos de áudio em nenhum plano pago.</p>
          <div className="plans sa-plans">
            <div className="plan free">
              <span className="sa-chip">Teste gratuito</span>
              <h3>Grátis</h3>
              <div className="price">R$ 0 <small>/mês</small></div>
              <p className="sa-plan-sub">Experimente a agilidade do Saium direto no navegador, sem cadastrar cartão.</p>
              <ul>
                <li>Teste gratuito do Texto em Áudio (MP3 e WAV)</li>
                <li>Uso diário das {EXTRAS} ferramentas extras</li>
                <li>Simulador de miniatura e contador SEO</li>
              </ul>
              <a className="btn ghost" href="#texto-audio">Começar teste grátis</a>
            </div>
            <div className="plan pro">
              <span className="sa-chip dark">Destaque principal • Áudio 100% ilimitado</span>
              <h3>Criador</h3>
              <div className="price">{brl(price)} <small>/mês</small></div>
              <p className="sa-plan-sub">Tudo o que você precisa para produzir e publicar vídeos sem limite de narrações.</p>
              <ul>
                <li>Texto em Áudio 100% ILIMITADO (MP3 e WAV)</li>
                <li>Controle total de velocidade e pausas no navegador</li>
                <li>Acesso irrestrito às {EXTRAS} ferramentas extras</li>
                <li>Removedor de silêncio, legendas .srt e criador de capa</li>
              </ul>
              {billing ? <Link className="btn" href="/conta">Assinar Plano Criador</Link> : <span className="soon">Assinatura ainda não disponível</span>}
            </div>
            <div className="plan studio">
              <span className="sa-chip">Múltiplos canais • Áudio 100% ilimitado</span>
              <h3>Estúdio</h3>
              <div className="price">{brl(PRICE.estudio)} <small>/mês</small></div>
              <p className="sa-plan-sub">Para quem gerencia múltiplos canais dark, séries e fluxos de produção em lote.</p>
              <ul>
                <li>Texto em Áudio 100% ILIMITADO (MP3 e WAV)</li>
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
            <details><summary>Meu texto é enviado para algum servidor?</summary><p>Não. A voz é baixada para o seu navegador e o áudio é gerado ali mesmo. O texto não sai do seu aparelho.</p></details>
            <details><summary>Por que a primeira geração demora mais?</summary><p>Na primeira vez, o navegador baixa o modelo da voz (uns 60 MB) e guarda para os próximos usos.</p></details>
            <details><summary>Como coloco pausas na narração?</summary><p>Escreva [PAUSA 0.5s] (ou [PAUSA - 3 segundos]) onde quiser o silêncio. O botão “Inserir pausa” faz isso por você.</p></details>
            <details><summary>Funciona no celular?</summary><p>Funciona, mas pode ser mais lento, e textos muito longos são mais seguros no computador, em Chrome ou Edge.</p></details>
          </div>
        </div>
      </section>

      <section className="sa-final">
        <div className="wrap">
          <h2>Gere áudios sem limite e suba seu próximo vídeo hoje.</h2>
          <p>Comece gratuitamente agora ou libere o Texto em Áudio ilimitado e todas as {EXTRAS} ferramentas extras por {brl(price)}/mês.</p>
          <a className="btn go" href="#texto-audio">Testar Texto em Áudio agora ↑</a>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
