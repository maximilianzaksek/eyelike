-- =====================================================================
-- EYELIKE Website-Builder — Schema (BUILDER-KONZEPT.md)
-- VORLAGE: __ADMIN_SECRET__ wird in der .local.sql durch das echte
-- Secret ersetzt (steht auch als BUILDER_ADMIN_SECRET in .env.local).
-- Sicherheitsmodell: Tabellen sind per RLS komplett gesperrt; jeder
-- Zugriff läuft über SECURITY-DEFINER-Funktionen. Das Token selbst ist
-- das Geheimnis des Kunden, das Admin-Secret das der Agentur.
-- =====================================================================

-- ---------- Tabellen ----------
create table if not exists public.builder_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  customer_name text not null,
  project_name text,
  status text not null default 'open' check (status in ('open','in_progress','completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.builder_responses (
  token_id uuid primary key references public.builder_tokens(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  phase text not null default 'welcome',
  step_index int not null default 0,
  summary jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.builder_config (
  id int primary key default 1 check (id = 1),
  admin_secret text not null
);

insert into public.builder_config (id, admin_secret)
values (1, '__ADMIN_SECRET__')
on conflict (id) do update set admin_secret = excluded.admin_secret;

-- ---------- RLS: alles dicht, Zugriff nur über RPCs ----------
alter table public.builder_tokens enable row level security;
alter table public.builder_responses enable row level security;
alter table public.builder_config enable row level security;

-- ---------- Kunden-RPCs (Token = Bearer-Geheimnis) ----------
create or replace function public.builder_validate(p_token text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  t builder_tokens;
  r builder_responses;
begin
  select * into t from builder_tokens where token = p_token;
  if not found then return null; end if;
  select * into r from builder_responses where token_id = t.id;
  return jsonb_build_object(
    'customerName', t.customer_name,
    'projectName', t.project_name,
    'status', t.status,
    'answers', coalesce(r.answers, '{}'::jsonb),
    'phase', coalesce(r.phase, 'welcome'),
    'stepIndex', coalesce(r.step_index, 0)
  );
end $$;

create or replace function public.builder_save(
  p_token text, p_answers jsonb, p_phase text, p_step_index int
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  t builder_tokens;
begin
  select * into t from builder_tokens where token = p_token;
  if not found or t.status = 'completed' then return false; end if;
  insert into builder_responses (token_id, answers, phase, step_index, updated_at)
  values (t.id, coalesce(p_answers,'{}'::jsonb), coalesce(p_phase,'welcome'), coalesce(p_step_index,0), now())
  on conflict (token_id) do update
    set answers = excluded.answers,
        phase = excluded.phase,
        step_index = excluded.step_index,
        updated_at = now();
  if t.status = 'open' then
    update builder_tokens set status = 'in_progress' where id = t.id;
  end if;
  return true;
end $$;

create or replace function public.builder_complete(p_token text, p_summary jsonb)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  t builder_tokens;
begin
  select * into t from builder_tokens where token = p_token;
  if not found then return false; end if;
  update builder_responses set summary = p_summary, phase = 'done', updated_at = now()
    where token_id = t.id;
  update builder_tokens set status = 'completed' where id = t.id;
  return true;
end $$;

-- ---------- Admin-RPCs (Secret aus builder_config) ----------
create or replace function public.builder_admin_create(
  p_secret text, p_customer text, p_project text
) returns text
language plpgsql security definer set search_path = public
as $$
declare
  new_token text;
begin
  if not exists (select 1 from builder_config where admin_secret = p_secret) then
    raise exception 'unauthorized';
  end if;
  new_token := encode(gen_random_bytes(12), 'hex');
  insert into builder_tokens (token, customer_name, project_name)
  values (new_token, p_customer, p_project);
  return new_token;
end $$;

create or replace function public.builder_admin_list(p_secret text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from builder_config where admin_secret = p_secret) then
    raise exception 'unauthorized';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'token', t.token,
      'customerName', t.customer_name,
      'projectName', t.project_name,
      'status', t.status,
      'createdAt', t.created_at,
      'updatedAt', r.updated_at,
      'coverage', case when r.answers is null then 0 else (select count(*) from jsonb_object_keys(r.answers)) end
    ) order by t.created_at desc)
    from builder_tokens t left join builder_responses r on r.token_id = t.id
  ), '[]'::jsonb);
end $$;

create or replace function public.builder_admin_get(p_secret text, p_token text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  t builder_tokens;
  r builder_responses;
begin
  if not exists (select 1 from builder_config where admin_secret = p_secret) then
    raise exception 'unauthorized';
  end if;
  select * into t from builder_tokens where token = p_token;
  if not found then return null; end if;
  select * into r from builder_responses where token_id = t.id;
  return jsonb_build_object(
    'token', t.token, 'customerName', t.customer_name, 'projectName', t.project_name,
    'status', t.status, 'createdAt', t.created_at,
    'answers', coalesce(r.answers,'{}'::jsonb), 'summary', r.summary, 'updatedAt', r.updated_at
  );
end $$;

-- Ausführungsrechte: nur die Funktionen sind öffentlich, nicht die Tabellen
revoke all on function public.builder_validate(text) from public;
revoke all on function public.builder_save(text, jsonb, text, int) from public;
revoke all on function public.builder_complete(text, jsonb) from public;
revoke all on function public.builder_admin_create(text, text, text) from public;
revoke all on function public.builder_admin_list(text) from public;
revoke all on function public.builder_admin_get(text, text) from public;
grant execute on function public.builder_validate(text) to anon, authenticated;
grant execute on function public.builder_save(text, jsonb, text, int) to anon, authenticated;
grant execute on function public.builder_complete(text, jsonb) to anon, authenticated;
grant execute on function public.builder_admin_create(text, text, text) to anon, authenticated;
grant execute on function public.builder_admin_list(text) to anon, authenticated;
grant execute on function public.builder_admin_get(text, text) to anon, authenticated;

-- ---------- Storage: Uploads (Logo + Bildmaterial) ----------
insert into storage.buckets (id, name, public)
values ('builder-uploads', 'builder-uploads', true)
on conflict (id) do nothing;

-- Upload nur in Ordner eines existierenden, nicht abgeschlossenen Tokens
drop policy if exists "builder upload" on storage.objects;
create policy "builder upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'builder-uploads'
    and exists (
      select 1 from public.builder_tokens t
      where t.token = (storage.foldername(name))[1]
        and t.status <> 'completed'
    )
  );

-- ---------- Demo-Token ----------
insert into public.builder_tokens (token, customer_name, project_name)
values ('demo-kunde-2026', 'Demo', 'EYELIKE Builder-Demo')
on conflict (token) do nothing;
