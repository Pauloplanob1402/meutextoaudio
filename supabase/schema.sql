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
