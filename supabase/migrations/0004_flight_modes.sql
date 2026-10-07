-- How each person is travelling, beyond a Geneva flight on the trip days.
-- Run once in the Supabase dashboard after 0002 and 0003.

alter table public.flights
  add column if not exists arr_mode text not null default 'geneva'
    check (arr_mode in ('geneva', 'other_flight', 'other')),
  add column if not exists arr_note text,
  add column if not exists dep_mode text not null default 'geneva'
    check (dep_mode in ('geneva', 'other_flight', 'other')),
  add column if not exists dep_note text;
