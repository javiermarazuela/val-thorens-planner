-- Chatbot guard rails: off-topic strikes and bans, daily AI limits, and the
-- anonymous question log. Run once in the Supabase dashboard after 0006.
--
-- Everything goes through small functions, so the site never needs a Supabase
-- service key. A signed-in member is identified by their login (auth.uid());
-- the test site's invented people use a "test:" id instead and can only ever
-- touch rows with that prefix.

-- 1. Strikes and usage are now keyed by a text id (a member or a test person),
--    so test people can be counted too. These tables were empty, so recreate.
drop table if exists public.chat_strikes;
drop table if exists public.chat_usage;

create table public.chat_strikes (
  subject text primary key,
  strikes int not null default 0,        -- off-topic questions in a row
  banned_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.chat_strikes enable row level security;

create table public.chat_usage (
  subject text not null,
  day date not null default ((now() at time zone 'utc')::date),
  ai_calls int not null default 0,
  primary key (subject, day)
);
alter table public.chat_usage enable row level security;
-- No policies on purpose: only the functions below can read or write these.

-- 2. The log learns where a question came from and what answered it.
alter table public.chat_log add column if not exists env text not null default 'live';
alter table public.chat_log drop constraint if exists chat_log_env_check;
alter table public.chat_log add constraint chat_log_env_check check (env in ('live', 'test'));

alter table public.chat_log drop constraint if exists chat_log_source_check;
alter table public.chat_log add constraint chat_log_source_check
  check (source in ('chip', 'search', 'profile', 'schedule', 'activity', 'ai', 'login', 'none'));

alter table public.chat_log drop constraint if exists chat_log_outcome_check;
alter table public.chat_log add constraint chat_log_outcome_check
  check (outcome in ('answered', 'unknown', 'offtopic', 'login_prompt', 'blocked', 'limit'));

-- 3. Who is asking. A signed-in member is always 'u:<their id>'. Without a
--    login, only a well-formed 'test:' id is accepted (the test site).
create or replace function public.chat_subject(p text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and public.is_member() then
    return 'u:' || auth.uid()::text;
  end if;
  if p is not null and p ~ '^test:[a-z0-9._@-]{3,80}$' then
    return p;
  end if;
  return null;
end;
$$;
revoke all on function public.chat_subject(text) from public, anon, authenticated;

-- 4. Before an AI call: is this person banned or over their daily limit?
create or replace function public.chat_gate(p_subject text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  s text := public.chat_subject(p_subject);
  v_strikes int;
  v_banned timestamptz;
  v_calls int;
  v_total int;
  today date := (now() at time zone 'utc')::date;
begin
  if s is null then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select strikes, banned_until into v_strikes, v_banned
    from public.chat_strikes where subject = s;
  -- A finished ban starts again from a clean slate.
  if v_banned is not null and v_banned <= now() then
    update public.chat_strikes set strikes = 0, banned_until = null, updated_at = now()
      where subject = s;
    v_strikes := 0;
    v_banned := null;
  end if;

  select coalesce(ai_calls, 0) into v_calls from public.chat_usage where subject = s and day = today;
  select coalesce(sum(ai_calls), 0) into v_total from public.chat_usage where day = today;

  return json_build_object(
    'strikes', coalesce(v_strikes, 0),
    'banned_until', v_banned,
    'calls_today', coalesce(v_calls, 0),
    'total_today', coalesce(v_total, 0)
  );
end;
$$;

-- 5. After an AI call: count it, and add or clear a strike. The third
--    off-topic question in a row starts a 24-hour ban.
create or replace function public.chat_after(p_subject text, p_offtopic boolean)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  s text := public.chat_subject(p_subject);
  n int := 0;
  v_banned timestamptz;
  today date := (now() at time zone 'utc')::date;
begin
  if s is null then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  insert into public.chat_usage (subject, day, ai_calls) values (s, today, 1)
    on conflict (subject, day) do update set ai_calls = public.chat_usage.ai_calls + 1;

  if p_offtopic then
    insert into public.chat_strikes (subject, strikes) values (s, 1)
      on conflict (subject) do update
        set strikes = public.chat_strikes.strikes + 1, updated_at = now()
      returning strikes into n;
    if n >= 3 then
      v_banned := now() + interval '24 hours';
      update public.chat_strikes set banned_until = v_banned, strikes = 0, updated_at = now()
        where subject = s;
    end if;
  else
    update public.chat_strikes set strikes = 0, updated_at = now() where subject = s and strikes <> 0;
  end if;

  return json_build_object('strikes', n, 'banned_until', v_banned);
end;
$$;

-- 6. Anonymous log. No person is stored, only what was asked and how it went.
create or replace function public.chat_log_add(
  p_env text, p_area text, p_source text, p_outcome text, p_question text
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.chat_log (env, area, source, outcome, question)
  values (
    case when p_env = 'test' then 'test' else 'live' end,
    left(coalesce(p_area, ''), 60),
    p_source,
    p_outcome,
    left(p_question, 300)
  );
$$;

revoke all on function public.chat_gate(text), public.chat_after(text, boolean),
  public.chat_log_add(text, text, text, text, text) from public;
grant execute on function public.chat_gate(text), public.chat_after(text, boolean),
  public.chat_log_add(text, text, text, text, text) to anon, authenticated;
