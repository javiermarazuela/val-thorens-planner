-- Add people to the login allowlist (+1s and anyone without a Columbia address).
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run again: anyone already on the list is skipped, not duplicated.
--
-- 1. Put each email in single quotes, separated by commas (none after the last).
-- 2. Change the note if you like. It is the same for the whole batch.
-- Case and stray spaces are fixed for you.

insert into public.allowed_emails (email, note)
select lower(trim(e)), 'plus one'
from unnest(array[
  'first.person@gmail.com',
  'second.person@outlook.com'
]) as e
on conflict (email) do nothing
returning email; -- lists only the people actually added

-- To see everyone on the list:
-- select email, note, added_at from public.allowed_emails order by added_at desc;

-- To lock someone out straight away:
-- delete from public.allowed_emails where email = 'first.person@gmail.com';
