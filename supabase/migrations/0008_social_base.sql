-- Social features, step 0 (base) and step 1 (flights view) for Euro Ski 27.
-- Run once in the Supabase dashboard after 0007: SQL Editor -> New query -> paste -> Run.

-- 1. One row per member for settings that apply to every social feature.
--    No row means "visible". Members read and change their own row only; what
--    other members see goes through the functions below, never this table.
create table if not exists public.member_profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name text,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.member_profiles enable row level security;

drop policy if exists "members read own profile" on public.member_profiles;
create policy "members read own profile" on public.member_profiles
  for select to authenticated
  using (user_id = auth.uid() and public.is_member());

drop policy if exists "members add own profile" on public.member_profiles;
create policy "members add own profile" on public.member_profiles
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "members update own profile" on public.member_profiles;
create policy "members update own profile" on public.member_profiles
  for update to authenticated
  using (user_id = auth.uid() and public.is_member())
  with check (user_id = auth.uid() and public.is_member());

create or replace function public.touch_member_profiles()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_member_profiles on public.member_profiles;
create trigger touch_member_profiles
  before update on public.member_profiles
  for each row execute function public.touch_member_profiles();

-- 2. Committee admins, for the screens that will edit points and teams.
--    Add rows in Table Editor -> admins. Emails must be lowercase. No policies:
--    the browser can't read or write this table.
create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  note text,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_member()
    and exists (
      select 1 from public.admins a where a.email = lower(auth.jwt() ->> 'email')
    );
$$;
grant execute on function public.is_admin() to authenticated;

-- 3. Everyone's flights, for the "who is travelling with me" view. Only name
--    and travel details, never an email or an account id. People who switched
--    "show me to other members" off are left out, except to themselves.
create or replace function public.flight_mates()
returns table (
  name text,
  is_me boolean,
  arr_mode text,
  arr_date date,
  arr_flight text,
  arr_airport text,
  arr_time time,
  arr_shuttle text,
  dep_mode text,
  dep_date date,
  dep_flight text,
  dep_airport text,
  dep_time time,
  dep_shuttle text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(nullif(trim(f.name), ''), split_part(f.email, '@', 1)),
    f.user_id = auth.uid(),
    f.arr_mode, f.arr_date, f.arr_flight, f.arr_airport, f.arr_time, f.arr_shuttle,
    f.dep_mode, f.dep_date, f.dep_flight, f.dep_airport, f.dep_time, f.dep_shuttle
  from public.flights f
  left join public.member_profiles p on p.user_id = f.user_id
  where public.is_member()
    and (f.user_id = auth.uid() or coalesce(p.visible, true))
  order by 1;
$$;
revoke all on function public.flight_mates() from public, anon;
grant execute on function public.flight_mates() to authenticated;
