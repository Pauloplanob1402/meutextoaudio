> **Antes de mexer no site, leia `PADROES.md` (medidas e decisões fixas) e `IDEIAS.md` (ideias para melhorar o Sauim).**

# Sauim — Feito. Subiu. Postado.

Ferramentas para criadores de YouTube, com foco em **Texto em Áudio** em português do Brasil, direto no navegador (vozes Piper em português: Faber, Cadu, Jeff e Tugão, e as vozes naturais Dora, Alex e Santa; a lista fica em `lib/voices.ts`).

Identidade: `lib/brand.ts` (nome, etapas Feito/Subiu/Postado, preços) e `app/sauim.css` (visual). Os números de ferramentas no texto do site são calculados a partir de `lib/tools.ts`.
O texto não sai do aparelho e não há custo por uso.

## Rodar no seu computador

```
npm install
npm run dev
```

Abra http://localhost:3000 no Chrome ou Edge. Na primeira geração o navegador baixa a voz (uns 60 MB).

Se o `npm install` der o erro `getaddrinfo ENOENT` no Windows, rode antes (na mesma janela do CMD):

```
set NODE_OPTIONS=--dns-result-order=ipv4first
```

## Publicar (GitHub + Vercel)

1. Crie um repositório no GitHub e envie os arquivos desta pasta (sem `node_modules` nem `.next`, que já estão no `.gitignore`).
2. Na Vercel: **Add New, Project**, escolha o repositório e clique em **Deploy**. Não precisa configurar nada.
3. Domínio: no projeto da Vercel, **Settings, Domains**, e siga as instruções de DNS.

## Vozes

A lista fica em `lib/voices.ts`. Há dois motores:
- **Piper** (Faber, Cadu, Jeff e Tugão): rápidas, uns 60 MB cada.

Cada voz tem o campo `plan`: `"free"` (qualquer pessoa) ou `"pro"` (só com o plano Criador ativo). Hoje Cadu e Jeff são gratuitas e as demais são do plano Criador. O site pergunta o plano em `/api/plano`. Trocar uma voz de plano é mudar uma palavra em `lib/voices.ts`; os textos dos planos e dos Termos acompanham sozinhos. Atenção: como a voz roda no navegador, o bloqueio é feito na tela, e quem tem conhecimento técnico consegue contorná-lo.
- **Kokoro** (Dora, Alex e Santa): mais naturais e mais lentas. Um modelo só (uns 90 MB) serve as três. Vem do Hugging Face (`onnx-community/Kokoro-82M-v1.0-ONNX`).

Com a hospedagem própria da voz ligada (`NEXT_PUBLIC_SELF_HOST=1`), as vozes Kokoro não aparecem no seletor, porque o modelo não é copiado para o seu site.

## Hospedar a voz por conta própria (opcional)

Por padrão, o navegador do visitante baixa a voz do Hugging Face e os arquivos de apoio do cdnjs e do jsDelivr (hospedagens públicas e gratuitas). Funciona bem para começar. Para não depender delas, dá para servir tudo do seu próprio site:

1. Rode uma vez no seu computador (precisa de internet):
   ```
   npm run self-host
   ```
   Isso cria `public/piper`, `public/ort` e `public/voices` (uns 80 MB no total, sendo a voz o maior arquivo, perto de 60 MB).
2. Crie um arquivo `.env.local` com esta linha (e configure a mesma variável na Vercel, em **Settings, Environment Variables**):
   ```
   NEXT_PUBLIC_SELF_HOST=1
   ```
3. Rode `npm run dev`, abra o site, e confirme na aba **Rede** (F12) que nada é baixado de `huggingface.co`, `cdnjs.cloudflare.com` ou `cdn.jsdelivr.net`.
4. Envie a pasta `public/` para o GitHub junto com o resto. O arquivo da voz passa de 50 MB, e o GitHub avisa, mas aceita (o limite é 100 MB por arquivo).

Antes de ligar, saiba que cada visitante novo baixa uns 60 MB do **seu** site. Confira o limite de tráfego do seu plano na Vercel (e se o plano gratuito permite uso comercial, caso você venha a cobrar). Se o tráfego crescer, o caminho comum é colocar esses arquivos num armazenamento de arquivos com tráfego barato (por exemplo, Cloudflare R2) e apontar para ele.

**Versão do onnxruntime-web**: o `package.json` fixa `onnxruntime-web` em `1.18.0` de propósito. A biblioteca de voz carrega arquivos dessa versão, e uma versão mais nova do pacote pode não combinar com eles. Não atualize sem testar.

## Login e assinatura (Supabase + Mercado Pago)

A base está pronta: login por link no e-mail, página de conta, assinatura mensal e controle do plano. O texto para áudio e as ferramentas continuam grátis e sem cadastro. Só `/conta`, `/login` e as rotas de cobrança usam login.

**Como funciona**: a pessoa entra em `/login` (recebe um link no e-mail), vai para `/conta`, clica em **Assinar o Pro**, paga no Mercado Pago e volta para `/conta`. O Mercado Pago avisa o site por webhook, e o plano muda para Pro quando a assinatura fica `authorized`. O cancelamento também é feito em `/conta`.

### 1. Supabase

1. Crie um projeto em supabase.com.
2. **SQL Editor, New query**: cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria a tabela `subscriptions` com regras de acesso (cada pessoa só vê a própria assinatura; só o servidor grava). Também inclui as permissões explícitas (`grant`) que projetos novos do Supabase exigem: sem elas, a API recusa a tabela com o erro `permission denied`.
3. **Authentication, URL Configuration**: em *Site URL* coloque o endereço do site (`https://seudominio.com.br`) e, em *Redirect URLs*, adicione `https://seudominio.com.br/auth/callback` e `http://localhost:3000/auth/callback`.
4. **Authentication, e-mail (SMTP)**: configure um serviço de envio próprio. O envio padrão do Supabase serve só para testes e tem limite baixo de mensagens, então não use em produção.
5. **Project Settings, API**: copie a URL, a chave *publishable* e a chave *secret*.

### 2. Mercado Pago

1. Em **Suas integrações**, crie uma aplicação e pegue o **Access Token**. Comece pelas credenciais de teste e as contas de teste do Mercado Pago; só depois use as de produção.
2. Em **Webhooks, Configurar notificações**, informe a URL `https://seudominio.com.br/api/mercadopago/webhook` e marque o evento de **Planos e assinaturas** (`subscription_preapproval`). Ao salvar, o Mercado Pago mostra a **assinatura secreta**: copie.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` (no seu computador) e preencha. Na Vercel, cadastre as mesmas variáveis em **Settings, Environment Variables** e faça um novo deploy (as variáveis `NEXT_PUBLIC_*` e `PRO_PRICE_BRL` entram no site durante o build). Se `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` e `PRO_PRICE_BRL` não estiverem definidas, o plano Pro continua aparecendo como "Em breve" e a cobrança fica desligada.

A `SUPABASE_SECRET_KEY` e o `MP_ACCESS_TOKEN` são segredos: nunca coloque no código, no GitHub nem em variáveis com `NEXT_PUBLIC_`.

### 4. Liberar um recurso só para assinantes

No servidor (rota de API ou página), use:

```ts
import { getAccount } from "@/lib/entitlements";

const account = await getAccount();
if (account?.plan !== "pro") return new Response("Só para assinantes", { status: 403 });
```

Não confie em nenhuma checagem feita só no navegador.

### Arquivos novos

- `proxy.ts` e `lib/supabase/`: sessão de login (no Next.js 16 o antigo `middleware.ts` chama `proxy.ts`; ele só roda em `/conta`, `/login`, `/auth` e nas rotas de cobrança)
- `lib/billing.ts`: Mercado Pago (criar, consultar e cancelar assinatura; conferir a assinatura do webhook)
- `lib/entitlements.ts`: quem é a pessoa e qual é o plano
- `app/login`, `app/conta`, `app/auth/*`: telas e rotas de entrada e saída
- `app/api/checkout`, `app/api/cancelar`, `app/api/mercadopago/webhook`: cobrança
- `components/LoginForm.tsx`, `components/AccountActions.tsx`
- `supabase/schema.sql` e `.env.example`

### Limites e o que NÃO foi testado

- **Nada foi testado com o Supabase e o Mercado Pago de verdade.** O projeto compila e, com variáveis falsas, conferi que o webhook recusa notificações sem assinatura válida, que checkout e cancelamento exigem login e que `/conta` leva para `/login`. O envio do link por e-mail, a gravação no banco, o checkout e a chegada do webhook precisam ser testados por você, com contas de teste.
- **E-mail do pagador**: a assinatura é criada com o e-mail do login. A documentação do Mercado Pago diz que, em assinaturas sem plano, o checkout valida o e-mail do pagador, mas não consegui ler o trecho completo. Se o pagamento recusar quando o e-mail do login for diferente do e-mail da conta Mercado Pago da pessoa, será preciso ajustar o fluxo.
- **Só cartão por enquanto.** Pix Automático não foi implementado.
- **Cobrança que falha**: o site só segue o status da assinatura (`authorized`, `paused`, `cancelled`). Não trata os avisos de cada cobrança (`subscription_authorized_payment`).
- **Cancelar encerra o acesso na hora**, sem manter o Pro até o fim do período pago.
- **Preço**: mudar `PRO_PRICE_BRL` vale só para novas assinaturas.
- **Plano único** (mensal). Sem teste grátis, anual, cupom ou nota fiscal.
- **Faltam** termos de uso, política de privacidade e um jeito de excluir a conta (exigências de LGPD). Crie antes de cobrar.

## Estrutura

- `app/page.tsx`: página (cabeçalho, seções, planos, perguntas)
- `components/Tool.tsx`: a ferramenta (texto, geração, player, download)
- `lib/tts.ts`: limpeza do texto, pausas `[PAUSA - X segundos]`, montagem do WAV e estimativa de duração (`WORDS_PER_MINUTE`)
- `lib/stretch.ts`: ajuste de velocidade do arquivo baixado sem mudar o tom
- `lib/mp3.ts`: converte o WAV em MP3 no navegador (biblioteca `@breezystack/lamejs`). A qualidade fica em `MP3_KBPS` (96 por padrão)
- `app/globals.css`: todo o visual
- `app/ferramentas.css`: o visual das páginas de ferramentas
- `app/ferramentas/`: a página com todas as ferramentas e uma página para cada uma
- `components/tools/`: uma tela por ferramenta (e `ToolView.tsx`, que liga cada endereço à sua tela)
- `lib/tools.ts`: a lista das ferramentas (nome, frase, grupo)
- `lib/ideas.ts`: as ideias de vídeo por assunto (edite aqui para mudar ou acrescentar)
- `lib/toolkit.ts`: os cálculos das ferramentas (hashtags, capítulos, legendas, remover silêncio)
- `next.config.ts` e `empty.ts`: necessários, porque a biblioteca de voz tem um trecho para Node (`fs`, `path`) que não roda no navegador

## O que ainda NÃO está feito

- **Recursos exclusivos do Pro**: a base de login e cobrança existe (veja abaixo), mas ainda não há nenhum recurso liberado só para assinantes (vozes premium, histórico). Quem assina hoje paga por algo que ainda não existe, então só ligue a cobrança quando houver o que entregar.
- **Termos de uso e Política de privacidade**: não há páginas. Crie antes de divulgar.
- **Exemplos de áudio na página**: foram retirados. Quando tiver os MP3, coloque em `public/audios` e adicione a seção.
- **PWA** (site instalável), imagem de compartilhamento e analytics.
- **Teste real da geração**: o projeto compila e a página abre, mas a geração de áudio não foi testada de ponta a ponta. Teste com um texto longo, em computador e celular.

## Limites conhecidos

- A geração roda no aparelho. Celulares mais fracos podem falhar com textos muito longos. O app pula o trecho que falhar e avisa.
- O arquivo baixado é MP3 (padrão) ou WAV, na velocidade escolhida (ajuste feito no navegador por `lib/stretch.ts`, sem mudar o tom). Para mudanças pequenas costuma soar bem, mas ajustes grandes podem deixar a voz menos natural. Há também o link "Baixar na velocidade original". Se a conversão para MP3 falhar, o app baixa o WAV e avisa.
- A duração mostrada abaixo da caixa de texto é uma **estimativa** (palavras por minuto mais as pausas). Depois de testar com um texto real, compare com o áudio gerado e ajuste `WORDS_PER_MINUTE` em `lib/tts.ts` se precisar.

## Ferramentas extras

Ficam em `/ferramentas`, com um link discreto no menu, abaixo da caixa de texto e no rodapé da página inicial. Todas rodam no navegador, sem servidor e sem custo por uso:

ideias de vídeo por assunto, tempo de fala, dividir texto em blocos, remover silêncio do áudio, título e descrição, hashtags e tags, capítulos, legendas (.srt), checklist de publicação, redimensionar imagem, criar miniatura, calendário de conteúdo (do mês) e calculadora de ganhos.

Para adicionar uma ferramenta nova:

1. Crie a tela em `components/tools/NomeDaFerramenta.tsx`.
2. Registre o endereço em `components/tools/ToolView.tsx`.
3. Inclua o nome e a frase em `lib/tools.ts`. O cartão aparece sozinho na página de ferramentas.

Checklist e calendário salvam no `localStorage` do navegador de cada pessoa. A calculadora de ganhos usa valores de exemplo (RPM 2, 5 e 10): troque pelos valores reais do seu YouTube Studio.

## E-mail de boas-vindas (plano Criador)

Quando o pagamento é confirmado (cartão ou Pix), o webhook envia **uma vez** um e-mail de boas-vindas com as vozes liberadas e as ferramentas para começar. O envio é feito pela API do Brevo, não pelo Supabase (o Supabase só envia os e-mails de login).

1. No Brevo: **SMTP e API > Chaves de API > Gerar uma nova chave** (é diferente da chave SMTP do Supabase). Confirme que `contato@sauim.com.br` está em **Remetentes e IPs** e que o domínio está autenticado (DKIM e DMARC).
2. Na Vercel (Settings > Environment Variables): `BREVO_API_KEY`, e se quiser `EMAIL_FROM` e `EMAIL_FROM_NAME`. Faça um novo deploy depois.
3. No Supabase (SQL Editor): rode `supabase/schema.sql` de novo. Ele acrescenta a coluna `welcome_sent_at`.
4. Para mudar o texto ou as ferramentas citadas, edite `lib/welcomeEmail.ts`. Abra `preview-email-boas-vindas.html` no navegador para ver o resultado.
