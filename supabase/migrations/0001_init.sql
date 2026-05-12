-- Universal Webinar — initial schema
-- Run in Supabase SQL Editor (https://supabase.com/dashboard → your project → SQL).
-- Idempotent where reasonable; safe to re-run during early development.

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type webinar_status as enum ('scheduled', 'live', 'ended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendee_role as enum ('guest', 'speaker', 'banned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type speak_request_status as enum ('pending', 'approved', 'denied', 'revoked');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Tables
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists webinars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  status webinar_status not null default 'scheduled',
  allow_speak_requests boolean not null default false,
  show_guest_count boolean not null default true,
  recording_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

-- Pin is kept in a separate table so anon SELECT on `webinars` can't leak the hash.
create table if not exists webinar_secrets (
  webinar_id uuid primary key references webinars(id) on delete cascade,
  pin_hash text,
  updated_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  name text not null,
  email text not null,
  registered_at timestamptz not null default now(),
  unique (webinar_id, email)
);

create table if not exists attendees (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  registration_id uuid references registrations(id) on delete set null,
  name text not null,
  email text not null,
  role attendee_role not null default 'guest',
  muted_by_admin boolean not null default false,
  livekit_identity text,
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  attendee_id uuid references attendees(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by_admin boolean not null default false
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  attendee_id uuid not null references attendees(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, attendee_id, emoji)
);

create table if not exists speak_requests (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references webinars(id) on delete cascade,
  attendee_id uuid not null references attendees(id) on delete cascade,
  status speak_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────────────────────

create index if not exists registrations_webinar_idx on registrations (webinar_id);
create index if not exists attendees_webinar_idx on attendees (webinar_id);
create index if not exists messages_webinar_created_idx on messages (webinar_id, created_at);
create index if not exists reactions_message_idx on reactions (message_id);
create index if not exists speak_requests_webinar_idx on speak_requests (webinar_id, status);

-- ──────────────────────────────────────────────────────────────────────────────
-- updated_at trigger for webinars
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists webinars_set_updated_at on webinars;
create trigger webinars_set_updated_at
  before update on webinars
  for each row execute function set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ──────────────────────────────────────────────────────────────────────────────
-- Model: single-admin platform. Any authenticated user is treated as the admin
-- and gets full read/write. Anonymous users (guests) get narrowly-scoped access.
-- Phase 3 will add per-attendee guest write policies for messages/reactions.

alter table webinars         enable row level security;
alter table webinar_secrets  enable row level security;
alter table registrations    enable row level security;
alter table attendees        enable row level security;
alter table messages         enable row level security;
alter table reactions        enable row level security;
alter table speak_requests   enable row level security;

-- webinars: public read (title/slug/status etc), admin full write
drop policy if exists "webinars public read" on webinars;
create policy "webinars public read"
  on webinars for select
  to anon, authenticated
  using (true);

drop policy if exists "webinars admin write" on webinars;
create policy "webinars admin write"
  on webinars for all
  to authenticated
  using (true)
  with check (true);

-- webinar_secrets: admin only
drop policy if exists "webinar_secrets admin" on webinar_secrets;
create policy "webinar_secrets admin"
  on webinar_secrets for all
  to authenticated
  using (true)
  with check (true);

-- registrations: anyone can insert (pre-registration form); admin can read/manage
drop policy if exists "registrations anon insert" on registrations;
create policy "registrations anon insert"
  on registrations for insert
  to anon, authenticated
  with check (true);

drop policy if exists "registrations admin read" on registrations;
create policy "registrations admin read"
  on registrations for select
  to authenticated
  using (true);

drop policy if exists "registrations admin update" on registrations;
create policy "registrations admin update"
  on registrations for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "registrations admin delete" on registrations;
create policy "registrations admin delete"
  on registrations for delete
  to authenticated
  using (true);

-- attendees / messages / reactions / speak_requests: admin only for now.
-- Guest-facing policies arrive in Phase 3 when the join+chat flow lands.
drop policy if exists "attendees admin" on attendees;
create policy "attendees admin" on attendees for all
  to authenticated using (true) with check (true);

drop policy if exists "messages admin" on messages;
create policy "messages admin" on messages for all
  to authenticated using (true) with check (true);

drop policy if exists "reactions admin" on reactions;
create policy "reactions admin" on reactions for all
  to authenticated using (true) with check (true);

drop policy if exists "speak_requests admin" on speak_requests;
create policy "speak_requests admin" on speak_requests for all
  to authenticated using (true) with check (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- Realtime publication
-- ──────────────────────────────────────────────────────────────────────────────
-- Tables that Phase 3+ subscribes to.

do $$ begin
  alter publication supabase_realtime add table webinars;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table reactions;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table speak_requests;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table attendees;
exception when duplicate_object then null; end $$;
