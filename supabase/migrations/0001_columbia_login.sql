-- Google login for Euro Ski 27, Columbia accounts only.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1. Exceptions (+1s and anyone else without a Columbia address).
--    Committee edits this in Table Editor -> allowed_emails -> Insert row.
--    Emails must be lowercase.
create table if not exists public.allowed_emails (
  email text primary key check (email = lower(email)),
  note text,
  added_at timestamptz not null default now()
);
alter table public.allowed_emails enable row level security;
-- No policies on purpose: the browser can never read or write this table.
-- Only the dashboard (service role) can.

-- 2. The one rule for who gets in.
create or replace function public.email_is_allowed(addr text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce(addr, '')) ~ '@(gsb\.)?columbia\.edu$'
    or exists (
      select 1 from public.allowed_emails a where a.email = lower(addr)
    );
$$;
revoke all on function public.email_is_allowed(text) from public, anon, authenticated;

-- 3. Block sign-up at the door: a non-Columbia address that is not on the
--    allowlist can't even create an account, whatever the browser does.
create or replace function public.reject_disallowed_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.email_is_allowed(new.email) then
    raise exception 'This site is for Columbia accounts only.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists reject_disallowed_signup on auth.users;
create trigger reject_disallowed_signup
  before insert on auth.users
  for each row execute function public.reject_disallowed_signup();

-- 4. Checked on every request, so removing someone from allowed_emails
--    locks them out straight away, even if they already have an account.
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.email_is_allowed(auth.jwt() ->> 'email');
$$;
grant execute on function public.is_member() to authenticated;

-- 5. Members-only links (WhatsApp group etc.), added in the dashboard so
--    they never live in the repo or the public page.
create table if not exists public.member_links (
  id bigint generated always as identity primary key,
  label text not null,
  url text not null,
  sort int not null default 0
);
alter table public.member_links enable row level security;

drop policy if exists "members read links" on public.member_links;
create policy "members read links" on public.member_links
  for select to authenticated
  using (public.is_member());
