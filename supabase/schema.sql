-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- Pode rodar mais de uma vez sem estragar nada.

-- 1) Tabela das assinaturas (uma linha por usuário)
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mp_preapproval_id text unique,
  status text not null default 'pending',   -- pending | authorized | paused | cancelled
  next_payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b) Marca de que o e-mail de boas-vindas já foi enviado (evita mandar duas vezes)
alter table public.subscriptions add column if not exists welcome_sent_at timestamptz;
-- Se JÁ existirem assinantes ativos que não devem receber o e-mail de boas-vindas, rode UMA vez, à parte:
--   update public.subscriptions set welcome_sent_at = now() where status = 'authorized' and welcome_sent_at is null;

-- 1c) Plano anual: período da assinatura e, no anual cancelado, até quando o ano pago vale.
--     RODE ISTO ANTES de publicar a versão com plano anual (o webhook passa a gravar essas colunas).
alter table public.subscriptions add column if not exists period text not null default 'monthly';   -- monthly | annual
alter table public.subscriptions add column if not exists access_until timestamptz;

-- 2) Regras de acesso (RLS): cada pessoa só enxerga a PRÓPRIA assinatura
alter table public.subscriptions enable row level security;

drop policy if exists "ler a propria assinatura" on public.subscriptions;
create policy "ler a propria assinatura" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- 3) Permissões explícitas (obrigatórias em projetos novos do Supabase, onde
--    tabelas novas em "public" não ficam acessíveis pela API automaticamente)
grant select on public.subscriptions to authenticated;                         -- usuário logado só lê (e a regra acima limita à própria linha)
grant select, insert, update, delete on public.subscriptions to service_role;  -- o servidor grava (checkout, cancelamento e webhook)
-- "anon" (visitante sem login) não recebe nada, de propósito.

-- 4) Cinto e suspensório: mesmo que o projeto tenha permissões padrão antigas, o navegador
--    (anon e authenticated) NUNCA grava nessa tabela. Quem grava é só o servidor (service_role).
revoke all on public.subscriptions from anon;
revoke insert, update, delete, truncate, references, trigger on public.subscriptions from authenticated;

-- 5) Caixa "o que faltou hoje?": mensagens curtas e ANÔNIMAS enviadas dentro das ferramentas.
--    Não guarda e-mail, usuário nem IP. Só você (pelo painel do Supabase) lê; o navegador nunca lê nem grava direto.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  tool text not null default 'geral',      -- slug da ferramenta onde a pessoa estava
  message text not null check (char_length(message) between 3 and 500)
);
alter table public.feedback enable row level security;   -- sem nenhuma regra: ninguém lê pela API pública
grant select, insert, update, delete on public.feedback to service_role;
revoke all on public.feedback from anon, authenticated;
-- Para ler as respostas do mês: Table Editor > feedback, ou
--   select created_at, tool, message from public.feedback order by created_at desc;

-- 6) Minha voz (plano Criador): a gravação de 5 a 10 s da PRÓPRIA voz do usuário, para ela ficar salva na conta
--    e aparecer na lista de vozes do Texto em áudio em qualquer aparelho. É dado pessoal sensível (voz):
--    cada pessoa só enxerga, grava e apaga a PRÓPRIA linha; o navegador nunca lê a de outra pessoa.
--    RODE ISTO ANTES de publicar a versão com a voz salva na conta. Pode rodar mais de uma vez.
create table if not exists public.minha_voz (
  user_id uuid primary key references auth.users (id) on delete cascade,   -- apagar a conta apaga a voz
  rate integer not null default 24000,
  seconds real not null default 0,
  audio text not null check (char_length(audio) <= 2000000),               -- áudio 16 bits em base64 (uns 640 KB para 10 s)
  updated_at timestamptz not null default now()
);
alter table public.minha_voz enable row level security;

drop policy if exists "ler a propria voz" on public.minha_voz;
create policy "ler a propria voz" on public.minha_voz
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "gravar a propria voz" on public.minha_voz;
create policy "gravar a propria voz" on public.minha_voz
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "atualizar a propria voz" on public.minha_voz;
create policy "atualizar a propria voz" on public.minha_voz
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "apagar a propria voz" on public.minha_voz;
create policy "apagar a propria voz" on public.minha_voz
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.minha_voz to authenticated;
grant select, insert, update, delete on public.minha_voz to service_role;
revoke all on public.minha_voz from anon;   -- visitante sem login nunca acessa
