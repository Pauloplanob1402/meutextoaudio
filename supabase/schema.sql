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
