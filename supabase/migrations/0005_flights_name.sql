-- Name next to the email, so the committee's sheet is readable.
-- Run once in the Supabase dashboard after 0004.

alter table public.flights add column if not exists name text;
