-- Social features, step 2: teams, points and challenge photos for Euro Ski 27.
-- Run once in the Supabase dashboard after 0008: SQL Editor -> New query -> paste -> Run.

-- 1. Who is on which team. The committee fills this from the allocation script
--    (scripts/allocate-teams.ts prints the insert). No policies: the browser can
--    never read this table, only the functions below. Year and gender stay here
--    and are never sent to anyone.
create table if not exists public.member_teams (
  email text primary key check (email = lower(email)),
  name text not null,
  team smallint not null check (team between 1 and 4),
  year text,
  gender text
);
alter table public.member_teams enable row level security;

-- 2. Points. Only an admin adds them (award_points below).
create table if not exists public.team_points (
  id bigint generated always as identity primary key,
  team smallint not null check (team between 1 and 4),
  points int not null,
  reason text not null,
  photo_id uuid,
  created_at timestamptz not null default now()
);
alter table public.team_points enable row level security;

-- 3. Challenge photos. Members add their own and read approved ones plus their
--    own; admins see and review everything.
create table if not exists public.challenge_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  team smallint not null check (team between 1 and 4),
  challenge text not null,
  path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.challenge_photos enable row level security;

create or replace function public.my_team()
returns smallint
language sql
stable
security definer
set search_path = ''
as $$
  select t.team from public.member_teams t
  where public.is_member() and t.email = lower(auth.jwt() ->> 'email');
$$;
revoke all on function public.my_team() from public, anon;
grant execute on function public.my_team() to authenticated;

drop policy if exists "members add own photos" on public.challenge_photos;
create policy "members add own photos" on public.challenge_photos
  for insert to authenticated
  with check (
    user_id = auth.uid() and public.is_member() and team = public.my_team()
  );

drop policy if exists "members read photos" on public.challenge_photos;
create policy "members read photos" on public.challenge_photos
  for select to authenticated
  using (
    public.is_member()
    and (status = 'approved' or user_id = auth.uid() or public.is_admin())
  );

drop policy if exists "admins review photos" on public.challenge_photos;
create policy "admins review photos" on public.challenge_photos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Private storage for the photos. A member uploads into a folder named after
--    their account id; members read, admins can read everything.
insert into storage.buckets (id, name, public)
values ('challenge-photos', 'challenge-photos', false)
on conflict (id) do nothing;

drop policy if exists "members upload own challenge photos" on storage.objects;
create policy "members upload own challenge photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'challenge-photos'
    and public.is_member()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "members read challenge photos" on storage.objects;
create policy "members read challenge photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'challenge-photos' and public.is_member());

-- 5. What members see. Names only; people who chose "hide me" are left out of
--    rosters, but their points still count for the team.
create or replace function public.team_roster()
returns table (name text, team smallint, is_me boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select t.name, t.team, t.email = lower(auth.jwt() ->> 'email')
  from public.member_teams t
  left join auth.users u on lower(u.email) = t.email
  left join public.member_profiles p on p.user_id = u.id
  where public.is_member()
    and (t.email = lower(auth.jwt() ->> 'email') or coalesce(p.visible, true))
  order by t.name;
$$;
revoke all on function public.team_roster() from public, anon;
grant execute on function public.team_roster() to authenticated;

create or replace function public.team_scores()
returns table (team smallint, points bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select g.team, coalesce(sum(p.points), 0)::bigint
  from generate_series(1, 4) as g(team)
  left join public.team_points p on p.team = g.team
  where public.is_member()
  group by g.team
  order by 2 desc, 1;
$$;
revoke all on function public.team_scores() from public, anon;
grant execute on function public.team_scores() to authenticated;

create or replace function public.team_points_log()
returns table (id bigint, team smallint, points int, reason text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.team, p.points, p.reason, p.created_at
  from public.team_points p
  where public.is_member()
  order by p.created_at desc
  limit 50;
$$;
revoke all on function public.team_points_log() from public, anon;
grant execute on function public.team_points_log() to authenticated;

-- 6. Admin only: give a team points, optionally for a photo (which is then
--    marked approved).
create or replace function public.award_points(
  p_team smallint,
  p_points int,
  p_reason text,
  p_photo uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only.' using errcode = '42501';
  end if;
  insert into public.team_points (team, points, reason, photo_id)
  values (p_team, p_points, p_reason, p_photo);
  if p_photo is not null then
    update public.challenge_photos set status = 'approved' where id = p_photo;
  end if;
end;
$$;
revoke all on function public.award_points(smallint, int, text, uuid) from public, anon;
grant execute on function public.award_points(smallint, int, text, uuid) to authenticated;
