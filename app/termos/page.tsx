import type { Metadata } from "next";
import { Email, FacaParte, Historia, LegalPage, OutraPagina, Resumo, Sec } from "@/components/Legal";
import { LEGAL, RECURSOS, VOZ } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso · Saium",
  description: "As regras de uso do Saium, do plano Criador, do cancelamento e do direito de arrependimento.",
};

const TOC = [
  { id: "quem", title: "Quem somos" },
  { id: "servico", title: "O que é o Saium" },
  { id: "conta", title: "Conta e acesso" },
  { id: "planos", title: "Planos e pagamento" },
  { id: "cancelar", title: "Cancelamento" },
  { id: "arrependimento", title: "Direito de arrependimento" },
  { id: "uso", title: "Como usar o Saium" },
  { id: "conteudo", title: "O seu texto e o áudio gerado" },
  { id: "informacoes", title: "Estimativas e sugestões das ferramentas" },
  { id: "disponibilidade", title: "Disponibilidade do site" },
  { id: "responsabilidade", title: "Responsabilidade" },
  { id: "propriedade", title: "Propriedade do site" },
  { id: "encerramento", title: "Encerramento de conta" },
  { id: "mudancas", title: "Mudanças nos Termos" },
  { id: "foro", title: "Lei aplicável e foro" },
  { id: "contato", title: "Contato" },
];

export default function Termos() {
  let n = 0;
  return (
    <LegalPage title="Termos de Uso" intro="Estas são as regras do jogo entre nós e você: curtas e claras. Leia antes de criar uma conta ou assinar o plano Criador." toc={TOC}>
      <Resumo>
        <ul>
          <li>O texto para áudio e as ferramentas são grátis e não precisam de conta.</li>
          <li>O plano Criador é uma assinatura mensal, renovada sozinha até você cancelar. Você cancela quando quiser, na sua conta.</li>
          <li>Você é responsável pelo texto que usa e pelo uso que faz do áudio.</li>
          <li>Não use o site para enganar, ofender ou violar direitos de outras pessoas.</li>
        </ul>
      </Resumo>

      <Sec id="quem" n={++n} title="Quem somos">
        <Historia>
          <p>Por enquanto, não divulgamos o CNPJ nem os nomes dos fundadores. Quem responde por estes Termos é <b>{LEGAL.nome}</b>, e você fala com a gente pelo e-mail <Email />.</p>
        </Historia>
      </Sec>

      <Sec id="servico" n={++n} title="O que é o Saium">
        <p>É um site que transforma texto em áudio em português do Brasil, usando uma voz sintética que roda no seu navegador, e que oferece ferramentas de apoio (como contador de título, capítulos, legendas, miniatura e calendário). Ao usar o site, você concorda com estes Termos e com a <OutraPagina href="/privacidade">Política de Privacidade</OutraPagina>.</p>
      </Sec>

      <Sec id="conta" n={++n} title="Conta e acesso">
        <p>Você usa o texto para áudio e as ferramentas sem conta. Para assinar o plano Criador, você entra com o seu e-mail (por um link de acesso){RECURSOS.loginGoogle ? " ou com o Google" : ""}.</p>
        <p>Você é responsável por manter o acesso ao seu e-mail seguro e por tudo o que acontece na sua conta. Informe apenas dados verdadeiros. Para assinar, é preciso ter 18 anos ou mais, ou ter a autorização de um responsável.</p>
      </Sec>

      <Sec id="planos" n={++n} title="Planos e pagamento">
        <ul>
          <li><b>Grátis:</b> texto para áudio, com limite de gerações, e ferramentas, sem custo.</li>
          <li><b>Criador:</b> assinatura mensal. O valor aparece na página da sua conta e no pagamento, antes de você confirmar.</li>
        </ul>
        <p>O pagamento é processado pelo Mercado Pago. A assinatura se renova todo mês, na mesma forma de pagamento, até você cancelar.</p>
        <p>Os recursos do plano Criador podem ser acrescentados ao longo do tempo. O que estiver marcado como “em breve” ainda não está disponível e não tem data prometida. Se mudarmos o preço, avisaremos antes, e o novo valor só vale para renovações futuras. Você poderá cancelar antes disso.</p>
      </Sec>

      <Sec id="cancelar" n={++n} title="Cancelamento">
        <p>Você cancela quando quiser, sozinho, na página <OutraPagina href="/conta">Minha conta</OutraPagina>. Ao cancelar, o acesso ao plano Criador termina na hora e nenhuma nova cobrança é feita. O cancelamento não devolve valores de períodos já cobrados, exceto no caso do direito de arrependimento abaixo.</p>
      </Sec>

      <Sec id="arrependimento" n={++n} title="Direito de arrependimento">
        <p>Se você assinou o plano Criador pela internet, pode desistir em até 7 dias corridos, contados da contratação, e pedir o reembolso integral do valor pago. Para isso, escreva para <Email /> usando o e-mail da sua conta.</p>
      </Sec>

      <Sec id="uso" n={++n} title="Como usar o Saium">
        <p>Você pode usar o site para fins pessoais ou profissionais, dentro da lei. <b>Não é permitido:</b></p>
        <ul>
          <li>usar o áudio para enganar pessoas, como fingir que ele foi gravado por uma pessoa real determinada;</li>
          <li>gerar conteúdo ilegal, de ódio, de assédio ou que exponha dados pessoais de outras pessoas;</li>
          <li>usar textos ou materiais de terceiros sem ter o direito de fazê-lo, violando direitos autorais, de imagem ou de voz;</li>
          <li>tentar burlar o plano Criador, acessar áreas restritas, sobrecarregar ou atacar o site;</li>
          <li>copiar o site para revender o serviço sem autorização.</li>
        </ul>
      </Sec>

      <Sec id="conteudo" n={++n} title="O seu texto e o áudio gerado">
        <p>O texto é seu, e você é responsável por ter o direito de usá-lo. O áudio é gerado no seu navegador e você pode baixá-lo. Nós não revisamos o que você escreve nem o que você gera.</p>
        <p>O áudio é criado por uma voz sintética de código aberto, à sua escolha (hoje: <b>{VOZ}</b>). A licença da voz usada também vale para o uso que você fizer do áudio, então, se pretende usá-lo em um projeto comercial, confira a licença da voz antes.</p>
      </Sec>

      <Sec id="informacoes" n={++n} title="Estimativas e sugestões das ferramentas">
        <p>As ferramentas dão estimativas e sugestões. A calculadora de ganhos, o tempo de fala, a nota do validador de gancho, a nota do testador de títulos, as faixas da revisão do vídeo, a projeção da calculadora de frequência e a simulação de título e miniatura mostram valores e resultados aproximados, e as ideias de vídeo e os títulos sugeridos são sugestões de formato. Nada disso é promessa de resultado nem aconselhamento financeiro, jurídico ou de saúde. As regras de outras plataformas, como os limites do YouTube, mudam: confira sempre a fonte oficial.</p>
      </Sec>

      <Sec id="disponibilidade" n={++n} title="Disponibilidade do site">
        <p>Fazemos o possível para manter o site no ar, mas ele é oferecido “como está”: pode ficar fora do ar, mudar ou perder recursos. A voz depende de arquivos baixados pelo seu navegador e pode ser mais lenta em aparelhos mais simples.</p>
      </Sec>

      <Sec id="responsabilidade" n={++n} title="Responsabilidade">
        <p>Dentro do que a lei permite, o Saium não responde por prejuízos indiretos, como perda de lucros, nem pelo uso que você faz do áudio. Nada nestes Termos limita os direitos que a lei garante a você como consumidor.</p>
      </Sec>

      <Sec id="propriedade" n={++n} title="Propriedade do site">
        <p>O código, o design e a marca Saium pertencem à equipe do Saium. Usar o serviço não transfere esses direitos para você.</p>
      </Sec>

      <Sec id="encerramento" n={++n} title="Encerramento de conta">
        <p>Podemos suspender ou encerrar contas que violem estes Termos. Você pode parar de usar o site ou pedir a exclusão da sua conta quando quiser, escrevendo para <Email />.</p>
      </Sec>

      <Sec id="mudancas" n={++n} title="Mudanças nos Termos">
        <p>Podemos atualizar estes Termos. A data no topo mostra a última atualização. Se a mudança for importante, avisaremos no site ou por e-mail. Continuar usando o site depois do aviso significa que você aceita a nova versão, e você pode cancelar a assinatura se não concordar.</p>
      </Sec>

      <Sec id="foro" n={++n} title="Lei aplicável e foro">
        <p>Estes Termos seguem as leis do Brasil. Para consumidores, o foro é o da cidade onde você mora.</p>
      </Sec>

      <Sec id="contato" n={++n} title="Contato">
        <p>Dúvidas sobre estes Termos: <Email />.</p>
      </Sec>
      <FacaParte />
    </LegalPage>
  );
}
