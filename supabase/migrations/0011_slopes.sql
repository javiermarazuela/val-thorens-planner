-- Social features, step 3: slope plans for Euro Ski 27 ("I'm skiing at 10:00 at
-- the Rond-Point des Pistes, medium"). Run once in the Supabase dashboard after
-- 0008: SQL Editor -> New query -> paste -> Run.

-- One plan per person per day, edited in place. Members read and change their
-- own row only; the board other members see goes through slope_board() below,
-- which leaves out anyone who chose "hide me".
create table if not exists public.slope_plans (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null check (day between date '2027-01-09' and date '2027-01-16'),
  time text not null check (time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  place text not null check (char_length(place) between 1 and 60),
  level text not null check (level in ('beginner', 'easy', 'medium', 'advanced', 'expert')),
  name text,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.slope_plans enable row level security;

drop policy if exists "members read own plans" on public.slope_plans;
create policy "members read own plans" on public.slope_plans
  for select to authenticated
  using (user_id = auth.uid() and public.is_member());

drop policy if exists "members add own plans" on public.slope_plans;
create policy "members add own plans" on public.slope_plans
  for insert to authenticated
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "members update own plans" on public.slope_plans;
create policy "members update own plans" on public.slope_plans
  for update to authenticated
  using (user_id = auth.uid() and public.is_member())
  with check (user_id = auth.uid() and public.is_member());

drop policy if exists "members delete own plans" on public.slope_plans;
create policy "members delete own plans" on public.slope_plans
  for delete to authenticated
  using (user_id = auth.uid() and public.is_member());

create or replace function public.touch_slope_plans()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_slope_plans on public.slope_plans;
create trigger touch_slope_plans
  before update on public.slope_plans
  for each row execute function public.touch_slope_plans();

-- Everyone's plans for one day: name, time, place, level. Never an email or an
-- account id. People who chose "hide me" are left out, except to themselves.
create or replace function public.slope_board(p_day date)
returns table (name text, is_me boolean, plan_time text, place text, level text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(nullif(trim(s.name), ''), split_part(u.email, '@', 1)),
    s.user_id = auth.uid(),
    s.time,
    s.place,
    s.level
  from public.slope_plans s
  left join auth.users u on u.id = s.user_id
  left join public.member_profiles p on p.user_id = s.user_id
  where public.is_member()
    and s.day = p_day
    and (s.user_id = auth.uid() or coalesce(p.visible, true))
  order by s.time, 1;
$$;
revoke all on function public.slope_board(date) from public, anon;
grant execute on function public.slope_board(date) to authenticated;
