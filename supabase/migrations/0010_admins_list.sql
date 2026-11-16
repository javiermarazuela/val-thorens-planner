-- Committee admins for Euro Ski 27 (can review challenge photos and give team
-- points). Safe to run again: someone already on the list is left as they are,
-- and nobody is removed. Add a person by adding a line to the values below
-- (lowercase email), then run the whole file.
-- Run in the Supabase dashboard after 0008: SQL Editor -> New query -> paste -> Run.

insert into public.admins (email, note)
values
  ('jm6088@columbia.edu', 'Javi')
on conflict (email) do nothing;

-- The current list.
select email, note, added_at from public.admins order by added_at;
