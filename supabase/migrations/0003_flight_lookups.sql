-- Shared cache of flight lookups, so each flight number + date costs at most
-- one API call however many people enter it. Run once in the Supabase
-- dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.flight_lookups (
  key text primary key,            -- e.g. 'UA956|2027-01-08'
  found boolean not null,
  result jsonb,                    -- the trimmed flight, when found
  fetched_at timestamptz not null default now()
);

alter table public.flight_lookups enable row level security;

-- Written by the lookup server function using the signed-in member's token.
drop policy if exists "members read lookups" on public.flight_lookups;
create policy "members read lookups" on public.flight_lookups
  for select to authenticated
  using (public.is_member());

drop policy if exists "members add lookups" on public.flight_lookups;
create policy "members add lookups" on public.flight_lookups
  for insert to authenticated
  with check (public.is_member());

drop policy if exists "members refresh lookups" on public.flight_lookups;
create policy "members refresh lookups" on public.flight_lookups
  for update to authenticated
  using (public.is_member())
  with check (public.is_member());
