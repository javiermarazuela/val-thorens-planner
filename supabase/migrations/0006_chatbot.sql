-- Chatbot tables for Euro Ski 27.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- The committee fills a Google Sheet (tabs Knowledge, Rooms, Shuttles) and
-- publishes it with the "Chatbot -> Publish to site" menu (see
-- supabase/sheet-sync/knowledge-sheet.gs). Supabase stays the source of truth
-- for the site; the sheet is the editing surface.

-- 1. What the bot knows. Anyone can read the "everyone" rows, members read
--    the "members" rows too. Hidden rows are never readable from the browser.
create table if not exists public.chat_knowledge (
  id text primary key check (id = lower(id) and id ~ '^[a-z0-9-]+$'),
  area text not null,
  question text not null,
  phrasings text[] not null default '{}',  -- other ways people ask it
  answer text not null default '',          -- empty + status 'tbc' = "to be confirmed"
  visibility text not null default 'everyone' check (visibility in ('everyone', 'members')),
  status text not null default 'tbc' check (status in ('confirmed', 'tbc', 'hidden')),
  link text,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.chat_knowledge enable row level security;

drop policy if exists "anyone reads public knowledge" on public.chat_knowledge;
create policy "anyone reads public knowledge" on public.chat_knowledge
  for select to anon, authenticated
  using (status <> 'hidden' and visibility = 'everyone');

drop policy if exists "members read member knowledge" on public.chat_knowledge;
create policy "members read member knowledge" on public.chat_knowledge
  for select to authenticated
  using (status <> 'hidden' and visibility = 'members' and public.is_member());

-- 2. Private per-person data, matched by Columbia email. A member reads their
--    own row only; nobody can see anyone else's room.
create table if not exists public.member_rooms (
  email text primary key check (email = lower(email)),
  name text,
  residence text,
  room text,
  note text,
  updated_at timestamptz not null default now()
);
alter table public.member_rooms enable row level security;

drop policy if exists "members read own room" on public.member_rooms;
create policy "members read own room" on public.member_rooms
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email') and public.is_member());

create table if not exists public.member_shuttles (
  email text primary key check (email = lower(email)),
  name text,
  arr_coach text,   -- e.g. "Coach 3"
  arr_time text,    -- free text, e.g. "Sat 9 Jan, 14:30"
  arr_pickup text,  -- where to meet it
  dep_coach text,
  dep_time text,
  dep_pickup text,
  note text,
  updated_at timestamptz not null default now()
);
alter table public.member_shuttles enable row level security;

drop policy if exists "members read own shuttle" on public.member_shuttles;
create policy "members read own shuttle" on public.member_shuttles
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email') and public.is_member());

-- 3. Strikes, daily AI use and the anonymous question log. No policies on
--    purpose: only the server function (service role) touches these.
create table if not exists public.chat_strikes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  strikes int not null default 0,        -- off-topic questions in a row
  banned_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.chat_strikes enable row level security;

create table if not exists public.chat_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  ai_calls int not null default 0,
  primary key (user_id, day)
);
alter table public.chat_usage enable row level security;

-- No user id here, so what people ask can't be traced back to them.
create table if not exists public.chat_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  area text,
  source text not null check (source in ('chip', 'search', 'profile', 'ai', 'none')),
  outcome text not null check (outcome in ('answered', 'unknown', 'offtopic', 'login_prompt', 'blocked')),
  question text not null
);
alter table public.chat_log enable row level security;
create index if not exists chat_log_created_idx on public.chat_log (created_at desc);
