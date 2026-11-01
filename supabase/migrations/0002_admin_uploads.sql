-- =====================================================================
-- EYELIKE Website-Builder — Phase 4: Upload-Listen + Fix Token-Erzeugung
-- Storage-RLS bleibt komplett zu; Auflisten läuft wie alles andere über
-- SECURITY-DEFINER-RPCs (Admin via Secret, Kunde via eigenem Token).
-- =====================================================================

-- Fix aus 0001: gen_random_bytes braucht pgcrypto (hier nicht installiert).
-- gen_random_uuid() ist eingebaut; 24 Hex-Zeichen ≈ 91 Zufallsbits — unguessbar.
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
  new_token := substr(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 1, 24);
  insert into builder_tokens (token, customer_name, project_name)
  values (new_token, p_customer, nullif(trim(p_project), ''));
  return new_token;
end $$;

create or replace function public.builder_admin_uploads(p_secret text, p_token text)
returns jsonb
language plpgsql security definer set search_path = public, storage
as $$
begin
  if not exists (select 1 from builder_config where admin_secret = p_secret) then
    raise exception 'unauthorized';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('name', o.name, 'createdAt', o.created_at) order by o.created_at)
    from storage.objects o
    where o.bucket_id = 'builder-uploads'
      and (storage.foldername(o.name))[1] = p_token
  ), '[]'::jsonb);
end $$;

create or replace function public.builder_list_uploads(p_token text)
returns jsonb
language plpgsql security definer set search_path = public, storage
as $$
begin
  if not exists (select 1 from builder_tokens where token = p_token) then
    return null;
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('name', o.name, 'createdAt', o.created_at) order by o.created_at)
    from storage.objects o
    where o.bucket_id = 'builder-uploads'
      and (storage.foldername(o.name))[1] = p_token
  ), '[]'::jsonb);
end $$;

revoke all on function public.builder_admin_uploads(text, text) from public;
revoke all on function public.builder_list_uploads(text) from public;
grant execute on function public.builder_admin_uploads(text, text) to anon, authenticated;
grant execute on function public.builder_list_uploads(text) to anon, authenticated;

-- Fix aus 0001: Die Upload-Policy las builder_tokens direkt — als anon greift
-- dort aber deren (komplett dichte) RLS, also schlug jeder Upload fehl.
-- Token-Check deshalb über eine SECURITY-DEFINER-Funktion.
create or replace function public.builder_token_open(p_token text)
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from builder_tokens
    where token = p_token and status <> 'completed'
  );
$$;

revoke all on function public.builder_token_open(text) from public;
grant execute on function public.builder_token_open(text) to anon, authenticated;

drop policy if exists "builder upload" on storage.objects;
create policy "builder upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'builder-uploads'
    and public.builder_token_open((storage.foldername(name))[1])
  );
