-- Flight details for Euro Ski 27: one editable row per person.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- The committee reads everything in Table Editor -> flights (service role).

create table if not exists public.flights (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  email text not null default (auth.jwt() ->> 'email'),

  arr_date date,
  arr_flight text,
  arr_airport text,       -- IATA code of the airport they land at
  arr_time time,          -- local landing time
  arr_shuttle text check (arr_shuttle in ('yes', 'no', 'unsure')),
  arr_source text check (arr_source in ('lookup', 'suggested', 'manual')),

  dep_date date,
  dep_flight text,
  dep_airport text,       -- IATA code of the airport they fly from
  dep_time time,          -- local take-off time
  dep_shuttle text check (dep_shuttle in ('yes', 'no', 'unsure')),
  dep_source text check (dep_source in ('lookup', 'suggested', 'manual')),

  updated_at timestamptz not null default now()
);

alter table public.flights enable row level security;

-- Members see and change their own row only.
drop policy if exists "members read own flights" on public.flights;
create policy "members read own flights" on public.flights
  for select to authenticated
  using (user_id = auth.uid() and public.is_member());

drop policy if exists "members add own flights" on public.flights;
create policy "members add own flights" on public.flights
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "members update own flights" on public.flights;
create policy "members update own flights" on public.flights
  for update to authenticated
  using (user_id = auth.uid() and public.is_member())
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "members delete own flights" on public.flights;
create policy "members delete own flights" on public.flights
  for delete to authenticated
  using (user_id = auth.uid() and public.is_member());

create or replace function public.touch_flights()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_flights on public.flights;
create trigger touch_flights
  before update on public.flights
  for each row execute function public.touch_flights();
