-- Security fix: members could insert a challenge photo with status 'approved'
-- and skip the committee review. A new photo must now start as 'pending'; only
-- admins (the review policy) and award_points() change it afterwards.
-- Run once in the Supabase dashboard after 0011: SQL Editor -> New query -> paste -> Run.

drop policy if exists "members add own photos" on public.challenge_photos;
create policy "members add own photos" on public.challenge_photos
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_member()
    and team = public.my_team()
    and status = 'pending'
  );
