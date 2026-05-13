-- Phase 3 — guest live join + chat + reactions
-- Run after 0001_init.sql. Idempotent where reasonable.

-- ──────────────────────────────────────────────────────────────────────────────
-- Schema additions
-- ──────────────────────────────────────────────────────────────────────────────

-- Link attendees to their Supabase auth user (anonymous or otherwise). Lets
-- RLS gate writes by ownership instead of trusting the client to send the
-- right attendee_id.
alter table attendees
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

-- One attendee row per (webinar, auth_user) pair.
create unique index if not exists attendees_webinar_auth_user_idx
  on attendees (webinar_id, auth_user_id)
  where auth_user_id is not null;

-- Denormalised author name on messages so chat renders without joining
-- attendees (which would leak emails through RLS). Populated by a trigger
-- below — the client doesn't get to spoof it.
alter table messages
  add column if not exists author_name text;

-- ──────────────────────────────────────────────────────────────────────────────
-- Author-name trigger: pull from attendees on every insert
-- ──────────────────────────────────────────────────────────────────────────────

create or replace function public.set_message_author_name() returns trigger
language plpgsql
as $$
begin
  new.author_name := coalesce(
    (select name from attendees where id = new.attendee_id),
    new.author_name,
    'Guest'
  );
  return new;
end;
$$;

drop trigger if exists messages_set_author_name on messages;
create trigger messages_set_author_name
  before insert on messages
  for each row execute function public.set_message_author_name();

-- ──────────────────────────────────────────────────────────────────────────────
-- Identity helpers used by RLS
-- ──────────────────────────────────────────────────────────────────────────────

-- True for the single platform admin: an authenticated user that signed in
-- with email/password (i.e. is not an anonymous Supabase user).
create or replace function public.is_admin() returns boolean
language sql stable
as $$
  select auth.uid() is not null
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false;
$$;

-- True when the current user has an attendee row in the given webinar.
create or replace function public.is_attendee(target_webinar uuid) returns boolean
language sql stable
as $$
  select exists (
    select 1 from attendees
    where webinar_id = target_webinar
      and auth_user_id = auth.uid()
  );
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- attendees RLS — guests can read+create their own row; admin owns everything
-- ──────────────────────────────────────────────────────────────────────────────

drop policy if exists "attendees admin" on attendees;
drop policy if exists "attendees admin all" on attendees;
drop policy if exists "attendees guest self select" on attendees;
drop policy if exists "attendees guest self insert" on attendees;

create policy "attendees admin all" on attendees
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "attendees guest self select" on attendees
  for select to authenticated
  using (auth_user_id = auth.uid());

create policy "attendees guest self insert" on attendees
  for insert to authenticated
  with check (
    auth_user_id = auth.uid()
    and role = 'guest'
    and not muted_by_admin
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- messages RLS — attendees in the webinar can read + post; admin owns all
-- ──────────────────────────────────────────────────────────────────────────────

drop policy if exists "messages admin" on messages;
drop policy if exists "messages admin all" on messages;
drop policy if exists "messages attendee select" on messages;
drop policy if exists "messages attendee insert" on messages;

create policy "messages admin all" on messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "messages attendee select" on messages
  for select to authenticated
  using (public.is_attendee(webinar_id));

create policy "messages attendee insert" on messages
  for insert to authenticated
  with check (
    public.is_attendee(webinar_id)
    and exists (
      select 1 from attendees a
      where a.id = attendee_id
        and a.webinar_id = messages.webinar_id
        and a.auth_user_id = auth.uid()
        and not a.muted_by_admin
    )
    and length(trim(content)) between 1 and 1000
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- reactions RLS — same model as messages, plus delete-own-reaction
-- ──────────────────────────────────────────────────────────────────────────────

drop policy if exists "reactions admin" on reactions;
drop policy if exists "reactions admin all" on reactions;
drop policy if exists "reactions attendee select" on reactions;
drop policy if exists "reactions attendee insert" on reactions;
drop policy if exists "reactions attendee delete own" on reactions;

create policy "reactions admin all" on reactions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "reactions attendee select" on reactions
  for select to authenticated
  using (
    exists (
      select 1 from messages m
      where m.id = reactions.message_id
        and public.is_attendee(m.webinar_id)
    )
  );

create policy "reactions attendee insert" on reactions
  for insert to authenticated
  with check (
    exists (
      select 1 from attendees a
      join messages m on m.id = reactions.message_id
      where a.id = reactions.attendee_id
        and a.webinar_id = m.webinar_id
        and a.auth_user_id = auth.uid()
        and not a.muted_by_admin
    )
  );

create policy "reactions attendee delete own" on reactions
  for delete to authenticated
  using (
    exists (
      select 1 from attendees a
      where a.id = reactions.attendee_id
        and a.auth_user_id = auth.uid()
    )
  );
