# Segurança do Saium: o que já está no código e o que falta nos painéis

Este arquivo é o passo a passo. A primeira parte mostra o que o código já faz. A segunda é a sua lista,
em ordem de importância, para fazer nos painéis (GitHub, Supabase, Vercel). Nada aqui muda o que o visitante vê.

## 1. O que já está no código

| Tema | O que foi feito |
|---|---|
| Chaves | Só a chave pública do Supabase vai ao navegador. A chave secreta, o token do Mercado Pago e o segredo do webhook ficam no servidor (`server-only`). O `.gitignore` já ignora `.env*`. |
| Banco (RLS) | A tabela `subscriptions` tem RLS: cada pessoa só lê a própria linha. O `schema.sql` agora também tira do navegador qualquer permissão de gravar (`revoke`). Quem grava é só o servidor. |
| Autenticação no servidor | Rotas de pagamento e cancelamento conferem o usuário com `getUser()`. O `proxy.ts` protege `/conta`. |
| Adulteração de campos | O preço vem de `PRO_PRICE_BRL` no servidor, nunca do navegador. O estado da assinatura vem direto da API do Mercado Pago, e o webhook confere a assinatura (HMAC). |
| Redirecionamento do login | `safeNext` foi corrigido: antes, `/\site.com` levava para fora do Saium. Agora só passa caminho do próprio site. |
| Pedidos de outros sites (CSRF) | `/api/checkout`, `/api/cancelar` e `/auth/sair` só aceitam POST vindo do próprio site. |
| Repetição | O checkout espera 15 segundos entre tentativas (evita duplo clique e abuso). |
| Cookies da sessão | `SameSite=Lax` e `Secure` em produção. `httpOnly` fica desligado porque o login por link precisa do cliente do navegador. |
| Webhook | O `data.id` só passa no formato esperado. |
| Cabeçalhos | HSTS (30 dias), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, e o CSP (veja a seção 3). `X-Powered-By` removido. |
| Anti-robô no login | Cloudflare Turnstile opcional (aparece só se a chave existir). |
| Dependências | `.github/dependabot.yml` avisa toda semana. `npm audit` estava com 0 vulnerabilidades. |
| Logs | As respostas de erro ao visitante são genéricas. No log, o erro do Mercado Pago é truncado em 300 caracteres. O `/api/csp-report` limita o tamanho e limpa quebras de linha. |

O que **não** se aplica a este site: upload para servidor (imagem, áudio e legenda são processados no navegador), hash de senha (o login é por link no e-mail, sem senha) e queries com texto montado à mão (tudo passa pelo cliente do Supabase, que já é parametrizado).

## 2. Sua lista de painéis (nesta ordem)

### GitHub (10 minutos)
1. Repositório > **Settings > Code security**: ligue **Secret scanning** e **Push protection** (barra o envio de uma chave por engano).
2. Na mesma tela, ligue **Dependabot alerts** e **Dependabot security updates**.
3. Confira se algum segredo já foi enviado no passado: na busca do repositório, procure por `sb_secret_`, `APP_USR-` e `service_role`. Se achar em qualquer arquivo ou commit antigo, **troque a chave** (apagar o arquivo não limpa o histórico). Para trocar: Supabase > Project Settings > API keys; Mercado Pago > Suas integrações > credenciais.

### Supabase (15 minutos)
1. **SQL Editor**: cole o `supabase/schema.sql` de novo e rode (pode repetir sem problema; agora inclui os `revoke`).
2. Ainda no SQL Editor, rode a verificação abaixo. Toda tabela deve aparecer com `rls_ligado = true`:
   ```sql
   select tablename, rowsecurity as rls_ligado
   from pg_tables where schemaname = 'public';
   ```
3. **Authentication > URL Configuration**: em **Site URL**, o seu domínio. Em **Redirect URLs**, só o seu domínio (`https://saium.com.br/auth/callback`). Não deixe `*`.
4. **Authentication > Rate Limits**: confira os limites de e-mail por hora. O envio de e-mail padrão do Supabase tem limite baixo (confira o número no painel); para produção, configure um SMTP próprio em **Authentication > SMTP**.
5. **Authentication > Providers**: desligue o que você não usa (só **Email** com link mágico).
6. **Anti-robô**: veja a seção 4. (O nome exato dos menus do Supabase e da Vercel pode mudar com o tempo.)

### Vercel (10 minutos)
1. **Settings > Environment Variables**: marque como **Sensitive** a `SUPABASE_SECRET_KEY`, a `MP_ACCESS_TOKEN` e a `MP_WEBHOOK_SECRET`.
2. **Settings > Deployment Protection**: proteja os endereços de teste (previews) para que não fiquem públicos.
3. **Firewall > Rules**: se o seu plano tiver, crie uma regra de limite de pedidos (rate limit) para `/api/*`, algo como 30 pedidos por minuto por IP.

### Mercado Pago
O endereço do webhook (`/api/mercadopago/webhook`) já confere a assinatura. Guarde o segredo só na Vercel. Se ele aparecer em algum lugar público, gere outro no painel e troque na Vercel.

## 3. Ligando o CSP (só depois de observar)

O CSP diz ao navegador de quais lugares o site pode carregar scripts, fontes e dados. Ele **já vai ao ar em modo relatório**: não bloqueia nada, só avisa.

1. Publique e use o site por 2 a 3 dias, **gerando um áudio no Texto em áudio** pelo menos uma vez (é o que mais depende de endereços externos: Hugging Face, cdnjs e jsDelivr).
2. Na Vercel, **Logs**, busque por `csp:`. Cada linha mostra `diretiva | endereço bloqueado | página`. Se não houver nada além de extensões do navegador, está pronto.
3. Crie a variável `CSP_MODE=enforce` na Vercel e publique de novo. Teste o Texto em áudio, o login e o pagamento.
4. Se algo quebrar, apague a variável e publique de novo: volta ao modo relatório.

Obs.: o CSP usa `'unsafe-inline'` em scripts porque o Next.js precisa dele sem deixar o site dinâmico. Mesmo assim ele barra framing, formulários para fora, `<object>` e conexões para endereços não listados.

Se você ligar a hospedagem própria da voz (`npm run self-host` e `NEXT_PUBLIC_SELF_HOST=1`), o CSP deixa de liberar o Hugging Face e os CDNs sozinho.

**HSTS:** começou com 30 dias. Depois de um mês sem problemas, aumente em `next.config.ts` (`max-age=31536000`). Evite `preload` e `includeSubDomains` sem ter certeza.

## 4. Anti-robô no login (Cloudflare Turnstile)

Opcional, e invisível para quase todo mundo. Ordem importa: se ligar o CAPTCHA no Supabase **antes** de colocar a chave do site, o login para de funcionar.

1. Crie uma conta grátis em dash.cloudflare.com > **Turnstile** > Add widget (seu domínio). Copie a **chave do site** e a **chave secreta**.
2. Vercel > Environment Variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = chave do site. Publique.
3. Teste o login (deve funcionar normalmente).
4. Só então: Supabase > **Authentication > Attack Protection > Enable CAPTCHA protection** > Turnstile > cole a **chave secreta**.
5. Se usar, cite o Cloudflare na Política de Privacidade (ele recebe o IP e dados do navegador na verificação).

## 5. Se uma chave vazar

Troque na hora, nesta ordem: (1) gere a nova no painel de origem (Supabase ou Mercado Pago), (2) atualize na Vercel, (3) publique de novo, (4) revogue a antiga. Se foi a `SUPABASE_SECRET_KEY`, confira a tabela `subscriptions` por linhas estranhas.
