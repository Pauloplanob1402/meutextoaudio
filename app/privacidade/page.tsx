import type { Metadata } from "next";
import { Email, FacaParte, Historia, LegalPage, OutraPagina, Resumo, Sec } from "@/components/Legal";
import { LEGAL, RECURSOS, VOZ_NO_PROPRIO_SITE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade · Sauim",
  description: "Quais dados o Sauim usa, para quê, com quem compartilha e quais são os seus direitos.",
};

const TOC = [
  { id: "quem", title: "Quem somos e quem cuida dos seus dados" },
  { id: "texto", title: "O que acontece com o seu texto" },
  { id: "conta", title: "Quais dados guardamos na sua conta" },
  { id: "voz", title: "Minha voz (beta)" },
  { id: "caixa", title: "A caixa “o que faltou hoje?”" },
  { id: "pagamento", title: "Pagamentos" },
  { id: "bases", title: "Para que usamos os dados" },
  { id: "terceiros", title: "Com quem compartilhamos" },
  { id: "cookies", title: "Cookies e armazenamento no navegador" },
  { id: "prazo", title: "Por quanto tempo guardamos" },
  { id: "direitos", title: "Seus direitos" },
  { id: "seguranca", title: "Segurança" },
  { id: "criancas", title: "Crianças e adolescentes" },
  { id: "mudancas", title: "Mudanças nesta política" },
  { id: "contato", title: "Contato" },
];

export default function Privacidade() {
  let n = 0;
  return (
    <LegalPage title="Política de Privacidade" intro="Esta política explica, em linguagem simples, quais dados o Sauim usa, para quê e quais são os seus direitos." toc={TOC}>
      <Resumo>
        <ul>
          <li>O seu texto vira áudio no seu navegador{RECURSOS.historicoNaNuvem ? ". Ele só vai para o nosso servidor se você escolher salvá-lo no histórico do plano Criador." : " e não vai para o nosso servidor."}</li>
          <li>Só guardamos o que é preciso para a sua conta e para a assinatura do plano Criador.</li>
          <li>Não vendemos os seus dados e não usamos anúncios nem ferramentas de análise de audiência.</li>
          <li>Você pode pedir acesso, correção ou exclusão dos seus dados quando quiser, escrevendo para <Email />.</li>
        </ul>
      </Resumo>

      <Sec id="quem" n={++n} title="Quem somos e quem cuida dos seus dados">
        <Historia>
          <p>Quem cuida dos seus dados é <b>{LEGAL.nome}</b>. Para qualquer assunto sobre privacidade, escreva para <Email />.</p>
        </Historia>
      </Sec>

      <Sec id="texto" n={++n} title="O que acontece com o seu texto">
        <p>Quando você cola um texto e gera o áudio, a conversão acontece dentro do seu navegador. Nós não recebemos esse texto para gerar o áudio e não o guardamos.</p>
        {RECURSOS.historicoNaNuvem && (
          <p>A única exceção é o <b>histórico na nuvem do plano Criador</b>: se você escolher salvar um texto na sua conta, ele fica guardado no nosso banco de dados até você apagá-lo ou pedir a exclusão da conta.</p>
        )}
        <p>Alguns recursos guardam informações <b>só no seu aparelho</b>, no armazenamento local do navegador: o rascunho do texto, a voz escolhida, as marcações do checklist, as anotações do calendário e as respostas e rascunhos das outras ferramentas (como o roteiro em blocos e o DNA de marca). Isso não vem para nós. Para apagar, limpe os dados do site no seu navegador.</p>
      </Sec>

      <Sec id="conta" n={++n} title="Quais dados guardamos na sua conta">
        <p>Você só precisa de conta para assinar o plano Criador. O texto para áudio com as vozes gratuitas funciona sem cadastro. Se você criar uma conta, guardamos:</p>
        <ul>
          <li><b>E-mail.</b> Para identificar a sua conta e enviar mensagens de acesso e confirmação.</li>
          <li><b>Senha.</b> Guardada de forma protegida (criptografada) pelo nosso provedor de autenticação; nós não a vemos.</li>
          {RECURSOS.loginGoogle && (
            <li><b>Dados do login com o Google.</b> Se você entrar com o Google, ele nos informa o seu e-mail e pode informar também o nome e a foto do perfil. Usamos apenas o e-mail para identificar a conta, mas o serviço de login pode guardar esses outros dados junto com ela.</li>
          )}
          <li><b>Assinatura.</b> O código da assinatura no Mercado Pago, o status (por exemplo, ativa, pausada ou cancelada), a data da próxima cobrança e as datas de criação e de atualização.</li>
          <li><b>Dados técnicos de acesso.</b> Endereço IP, tipo de navegador e horários de acesso podem ser registrados pelos serviços que usamos (login e hospedagem), por segurança e para o site funcionar.</li>
        </ul>
        <p>O Sauim não pede CPF, telefone nem endereço para criar a conta. O Mercado Pago pode pedir dados no momento do pagamento.</p>
      </Sec>

      <Sec id="voz" n={++n} title="Minha voz (beta)">
        <p>Na ferramenta Minha voz (beta), os <b>textos e o áudio gerado</b> são processados no seu aparelho: nós não os recebemos. Já a <b>gravação de 5 a 10 segundos da sua voz</b> (a sua voz é um dado pessoal) fica salva na <b>sua conta</b> do plano Criador, em área privada que só você consegue ler, para você não precisar gravar de novo e para a sua voz aparecer na lista de vozes do Texto em áudio em qualquer aparelho. Usamos a gravação apenas para isso, não a ouvimos nem a compartilhamos. Uma cópia também fica no navegador do seu aparelho. Você pode apagar a gravação a qualquer momento no botão “Apagar a gravação” (apaga do aparelho e da conta); ao excluir a conta, ela também é apagada. Uma gravação feita antes dessa novidade só vai para a conta se você clicar em “Salvar na minha conta”. Na primeira vez, o navegador baixa o modelo de voz do Hugging Face e o motor de execução do jsDelivr, que podem registrar o seu endereço IP, como já acontece com as demais vozes.</p>
      </Sec>

      <Sec id="caixa" n={++n} title="A caixa “o que faltou hoje?”">
        <p>No pé de cada ferramenta há uma caixa para você contar, em uma frase, o que faltou. A mensagem é <b>anônima</b>: guardamos apenas o texto, a ferramenta em que você estava e a data. Não guardamos o seu e-mail, o seu usuário nem o seu endereço IP junto com ela. Usamos as mensagens para decidir quais ferramentas criar e melhorar. Por isso, <b>não escreva dados pessoais</b> (e-mail, telefone, senha, documentos). Como a mensagem é anônima, não conseguimos achar a sua para apagá-la depois; se escrever algo por engano, avise em <Email /> informando o trecho e a data aproximada, e removemos.</p>
      </Sec>

      <Sec id="pagamento" n={++n} title="Pagamentos">
        <p>Os pagamentos acontecem no ambiente do Mercado Pago. Você informa os dados do cartão ou da forma de pagamento diretamente a eles: o Sauim não recebe nem guarda número de cartão. Enviamos ao Mercado Pago o seu e-mail e um identificador da sua conta, só para ligar a assinatura a você. A política de privacidade do Mercado Pago explica como eles tratam os seus dados.</p>
      </Sec>

      <Sec id="bases" n={++n} title="Para que usamos os dados">
        <p>A lei (LGPD) pede que cada uso de dados tenha uma justificativa. As nossas são estas:</p>
        <ul>
          <li>Criar e manter a sua conta e entregar o plano Criador. <span className="count">Justificativa: execução do contrato.</span></li>
          <li>Cobrar a assinatura e cumprir obrigações legais, como as fiscais. <span className="count">Justificativa: execução do contrato e cumprimento de obrigação legal.</span></li>
          <li>Manter o site seguro e evitar abusos. <span className="count">Justificativa: legítimo interesse.</span></li>
          <li>Responder aos seus pedidos e dúvidas, inclusive sobre os seus dados. <span className="count">Justificativa: atendimento a pedido seu.</span></li>
        </ul>
        <p>Não usamos os seus dados para publicidade e não os vendemos.</p>
      </Sec>

      <Sec id="terceiros" n={++n} title="Com quem compartilhamos">
        <p>Usamos serviços de terceiros para o site funcionar. Cada um recebe só o necessário:</p>
        <ul>
          <li><b>Supabase</b>: login e banco de dados (e-mail, conta e assinatura).</li>
          <li><b>{LEGAL.hospedagem}</b>: hospedagem do site. Pode registrar dados técnicos de acesso, como o IP.</li>
          <li><b>Mercado Pago</b>: pagamento e assinatura.</li>
          <li><b>{LEGAL.envioEmail}</b>: envio dos e-mails de acesso à conta e do e-mail de boas-vindas da assinatura. Recebe o seu e-mail, o seu nome (se houver) e o conteúdo da mensagem.</li>
          <li><b>{LEGAL.encaminhamento}</b>: encaminhamento das mensagens que você envia para o nosso e-mail de contato. Recebe o que você escrever para nós, incluindo o seu e-mail.</li>
          {RECURSOS.loginGoogle && <li><b>Google</b>: login com o Google, se você escolher essa opção.</li>}
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <li><b>Cloudflare</b>: verificação anti-robô na tela de login (Turnstile). Ela recebe o seu IP e dados do navegador para confirmar que o acesso não é automatizado.</li>}
          <li><b>Google Fonts</b>: ao abrir o site, o seu navegador carrega as fontes de letra dos servidores do Google, que podem registrar o seu IP.</li>
          {!VOZ_NO_PROPRIO_SITE && (
            <li><b>Hugging Face e redes de distribuição de arquivos</b> (como cdnjs e jsDelivr): na primeira vez que você gera um áudio, o navegador baixa a voz e arquivos auxiliares desses serviços, que podem registrar o seu IP.</li>
          )}
        </ul>
        <p>Também podemos compartilhar dados quando a lei ou uma ordem judicial exigir. Alguns desses serviços podem tratar dados em outros países.</p>
      </Sec>

      <Sec id="cookies" n={++n} title="Cookies e armazenamento no navegador">
        <p>Usamos só o necessário: cookies de sessão do login, que mantêm você conectado depois de entrar (só existem se você tiver conta), e o armazenamento local do navegador descrito acima. Não usamos cookies de publicidade nem de análise de audiência.</p>
      </Sec>

      <Sec id="prazo" n={++n} title="Por quanto tempo guardamos">
        <p>Guardamos os dados da conta e da assinatura enquanto a conta existir. Se você pedir a exclusão, apagamos esses dados, exceto o que a lei nos obrigue a manter, como registros de pagamento (que também ficam com o Mercado Pago). Cópias de segurança dos serviços que usamos podem levar algum tempo para desaparecer.</p>
      </Sec>

      <Sec id="direitos" n={++n} title="Seus direitos">
        <p>A LGPD garante a você, entre outros, o direito de:</p>
        <ul>
          <li>confirmar se tratamos dados seus e acessá-los;</li>
          <li>corrigir dados incompletos ou errados;</li>
          <li>pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados fora da lei;</li>
          <li>pedir a portabilidade dos seus dados;</li>
          <li>saber com quem compartilhamos os seus dados;</li>
          <li>retirar um consentimento que tenha dado;</li>
          <li>reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
        <p>Para pedir qualquer um deles, escreva para <Email />, de preferência pelo mesmo e-mail da sua conta. Buscamos responder em até 15 dias. Para excluir a conta, basta pedir pelo mesmo endereço. Já o cancelamento da assinatura você faz sozinho na página <OutraPagina href="/conta">Minha conta</OutraPagina>.</p>
      </Sec>

      <Sec id="seguranca" n={++n} title="Segurança">
        <p>Usamos conexão segura (HTTPS), regras no banco de dados para que cada pessoa só veja a própria assinatura e guardamos as chaves secretas apenas no servidor. Nenhum sistema é totalmente seguro. Se houver um incidente que possa afetar você de forma relevante, avisaremos como a lei determina.</p>
      </Sec>

      <Sec id="criancas" n={++n} title="Crianças e adolescentes">
        <p>O Sauim não é feito para crianças. Quem tem menos de 18 anos só deve criar conta e assinar o plano Criador com a autorização e o acompanhamento de um responsável.</p>
      </Sec>

      <Sec id="mudancas" n={++n} title="Mudanças nesta política">
        <p>Podemos atualizar esta página. A data no topo mostra a última atualização. Se a mudança for importante, avisaremos no site ou por e-mail. Os <OutraPagina href="/termos">Termos de Uso</OutraPagina> também valem para o uso do site.</p>
      </Sec>

      <Sec id="contato" n={++n} title="Contato">
        <p>Dúvidas, pedidos ou reclamações sobre os seus dados: <Email />.</p>
      </Sec>
      <FacaParte />
    </LegalPage>
  );
}
