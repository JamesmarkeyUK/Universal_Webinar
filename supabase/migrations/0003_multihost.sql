-- Phase 3.5 — pivot to multi-host SaaS:
--   • Anyone can create a webinar without signing up.
--   • A unique `manage_token` (UUID) is the secret that authorises the host to
--     edit / share / delete their own webinar before they've verified their
--     email.
--   • Email is OTP-verified right before going live; once verified, the host
--     is a real Supabase auth user and their webinars are tied via host_email.
--   • Per-webinar branding (logo URL + company name) lands on the webinars
--     row so hosts get a free taste of branding without a Pro plan.
--   • The platform-level admin (Accounts@unisim.co.uk) keeps full access.

-- ──────────────────────────────────────────────────────────────────────────────
-- Schema: host fields + per-webinar branding
-- ──────────────────────────────────────────────────────────────────────────────

alter table webinars
  add column if not exists host_name text,
  add column if not exists host_email text,
  add column if not exists company_name text,
  add column if not exists logo_url text,
  add column if not exists host_verified boolean not null default false,
  add column if not exists manage_token uuid not null default gen_random_uuid();

create index if not exists webinars_host_email_idx on webinars (lower(host_email));
create index if not exists webinars_manage_token_idx on webinars (manage_token);

-- ──────────────────────────────────────────────────────────────────────────────
-- is_admin() — pin to the platform admin email so OTP-verified hosts don't
-- inherit god-mode just by being authenticated.
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') = 'accounts@unisim.co.uk',
    false
  );
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Webinar RLS — replace the old "any authenticated user is admin" policy
-- with three layered policies: anon read, host-by-token write (via RPC),
-- and verified-host self-management.
-- ──────────────────────────────────────────────────────────────────────────────

drop policy if exists "webinars admin write" on webinars;
drop policy if exists "webinars anon insert" on webinars;
drop policy if exists "webinars host update" on webinars;
drop policy if exists "webinars host delete" on webinars;

-- Anon can INSERT a brand-new webinar row. manage_token defaults to a UUID,
-- host_verified defaults to false, status defaults to 'scheduled'.
create policy "webinars anon insert" on webinars
  for insert to anon, authenticated
  with check (
    -- you can only create rows that start out un-verified
    coalesce(host_verified, false) = false
    and coalesce(status, 'scheduled') in ('scheduled', 'live')
  );

-- Authenticated users (= OTP-verified hosts) can update / delete their own
-- webinars based on email match.
create policy "webinars verified host update" on webinars
  for update to authenticated
  using (
    public.is_admin()
    or lower(host_email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    public.is_admin()
    or lower(host_email) = lower(auth.jwt() ->> 'email')
  );

create policy "webinars verified host delete" on webinars
  for delete to authenticated
  using (
    public.is_admin()
    or lower(host_email) = lower(auth.jwt() ->> 'email')
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- RPC: manage a webinar via the secret manage_token (for unverified hosts).
-- Runs as security definer so it can bypass RLS — the token IS the auth.
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function public.update_webinar_by_token(
  p_slug text,
  p_token uuid,
  p_patch jsonb
) returns webinars
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row webinars;
  v_allowed text[] := array[
    'title', 'description', 'scheduled_at', 'started_at', 'ended_at',
    'status', 'allow_speak_requests', 'show_guest_count', 'recording_url',
    'host_name', 'company_name', 'logo_url'
  ];
  v_filtered jsonb;
  v_key text;
begin
  -- Strip any keys the host shouldn't be able to overwrite (manage_token,
  -- host_email, host_verified, etc.).
  v_filtered := '{}'::jsonb;
  for v_key in select jsonb_object_keys(p_patch) loop
    if v_key = any(v_allowed) then
      v_filtered := v_filtered || jsonb_build_object(v_key, p_patch->v_key);
    end if;
  end loop;

  update webinars
  set
    title                = coalesce(v_filtered->>'title', title),
    description          = coalesce(v_filtered->>'description', description),
    scheduled_at         = case
                             when v_filtered ? 'scheduled_at'
                             then (v_filtered->>'scheduled_at')::timestamptz
                             else scheduled_at
                           end,
    started_at           = case
                             when v_filtered ? 'started_at'
                             then (v_filtered->>'started_at')::timestamptz
                             else started_at
                           end,
    ended_at             = case
                             when v_filtered ? 'ended_at'
                             then (v_filtered->>'ended_at')::timestamptz
                             else ended_at
                           end,
    status               = coalesce((v_filtered->>'status')::webinar_status, status),
    allow_speak_requests = coalesce((v_filtered->>'allow_speak_requests')::boolean, allow_speak_requests),
    show_guest_count     = coalesce((v_filtered->>'show_guest_count')::boolean, show_guest_count),
    recording_url        = coalesce(v_filtered->>'recording_url', recording_url),
    host_name            = coalesce(v_filtered->>'host_name', host_name),
    company_name         = coalesce(v_filtered->>'company_name', company_name),
    logo_url             = coalesce(v_filtered->>'logo_url', logo_url)
  where slug = p_slug and manage_token = p_token
  returning * into v_row;

  if v_row is null then
    raise exception 'Invalid slug or manage token' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

revoke all on function public.update_webinar_by_token(text, uuid, jsonb) from public;
grant execute on function public.update_webinar_by_token(text, uuid, jsonb)
  to anon, authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- RPC: mark a webinar as verified once its host completes OTP. Anyone can
-- call this, but the caller's auth email must match the stored host_email.
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function public.verify_webinar_host(p_slug text)
returns webinars
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row webinars;
  v_email text;
begin
  v_email := lower(auth.jwt() ->> 'email');
  if v_email is null or v_email = '' then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  update webinars
  set host_verified = true
  where slug = p_slug
    and lower(host_email) = v_email
  returning * into v_row;

  if v_row is null then
    raise exception 'Webinar not found or host email mismatch' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

revoke all on function public.verify_webinar_host(text) from public;
grant execute on function public.verify_webinar_host(text) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────────
-- Storage: a public `logos` bucket for per-webinar host logos.
-- ──────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "logos public read" on storage.objects;
create policy "logos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'logos');

drop policy if exists "logos anon upload" on storage.objects;
create policy "logos anon upload"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'logos'
    -- 1 MB cap to deter abuse; tweak as needed.
    and coalesce((metadata ->> 'size')::bigint, 0) < 1024 * 1024
  );

drop policy if exists "logos anon update" on storage.objects;
create policy "logos anon update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'logos')
  with check (bucket_id = 'logos');
