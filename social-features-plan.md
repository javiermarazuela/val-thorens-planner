# Social features plan (draft, 2026-10-14)

Members-only, inside `/members`. Nothing on the public guide (hard rule 4). Real site code never contains fake data: test-only data is found with `import.meta.glob`, as the chatbot does.

## Decisions so far
- Visibility: all signed-in members see each other by default (name only, never email). One-tap "hide me" in the profile. Privacy page gets a new line.
- Teams: 4 teams replace "Your apartment is your team" (`teamGames` in `trip.ts`). Random but balanced by size and residence (tested: 4 x 50, residences spread evenly).
- Points: a Supabase table linked to a Google Sheet the committee edits, plus a password/role-gated admin screen on the site.
- Flights view: names on my flight, names on my coach, arrivals by day across the group.
- Slope plan: time + sector + level.

## Build order (one PR each, branch off main, then merge into `testdata` to try with the fake crowd)
0. **Base** (migration 0008): `member_profiles` (user_id, display name, `visible` default true, team), `admins` table, helper `is_admin()`. Profile toggle in `/members`.
1. **Flights** (0009): a view/RPC returning only name, arrival/departure flight, date, coach slot; "my flight", "my coach", "arrivals by day". Empty states for solo flights and for people with no coach (Lyon, Paris, early, late).
2. **Teams** (0010): `teams` and `team_points`; allocation script (seeded, balanced) the committee runs once; team page with roster, team activities, leaderboard; Sheet sync via Apps Script; admin entry screen.
3. **Slopes** (0011): `slope_plans` (user_id, date, time, sector, level, expires_at); post form, board grouped by time and sector, "ski with me" flag; polling every 30 to 60 s; auto-expiry.

## Test data
Extend `scripts/gen-test-data.mjs` with team, level and a few plans per person so each page can be tried with the 200 fake travellers.

## Still open
- Sector list for Slopes (and levels wording).
- Team names, colours, mascot.
- What "team activities" are (list, dates, scoring rules).
- Who is an admin (emails to seed `admins`).
- Real team balancing inputs beyond residence (programme year, ski level) if the sign-up can supply them.
