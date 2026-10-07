# Euro Ski '27

Website and guide for a Columbia Business School Ski Club trip. 170+ people, Val Thorens, French Alps, Saturday 9 January to Saturday 16 January 2027. The trip has sold out, so the site is now the guide for attendees, used mostly on a phone. The original sign-up and price page is kept at `/archive` (unlinked, noindex).

Bookings run through SkiSync (trip 752, organiser CBS Snow Sports). The registration link, prices, inclusions and cancellation and transfer deadlines all come from SkiSync's registration pages and terms. When SkiSync changes, `src/lib/trip.ts` changes to match.

## Stack

- TanStack Start v1, React 19, Vite, Tailwind CSS v4, @tanstack/react-router
- Package manager: bun
- Hosting: Vercel, connected to this GitHub repo, preview deploys on every pull request. Live at https://cbseuroski.com (`www` redirects to it).
- Supabase (Auth and database) is in use since phase 2. Browser env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Never expose the `service_role` key.

## Structure

- Single page at `src/routes/index.tsx`: a scroll-through guide. Sections are components in `src/components/sections/`, registered in `registry.ts` and wrapped in `guide-section.tsx` (band, number badge, heading). The page order comes from `journeyOrder` / `tripOrder` in `trip.ts`, picked by date in `src/lib/guide-order.ts` (journey order until 9 Jan 2027, trip order after; `?order=trip` or `?order=journey` forces one). An id with no registered component is skipped. To add a section: add its id to `SectionId`, `sectionMeta` and both order lists, write the component, register it.
- Navigation: `src/components/guide-nav.tsx` holds the desktop trail rail (from 1100px), the sticky header with progress line, and the phone chip bar; `src/lib/use-scroll-spy.ts` tracks the current section. `site-header.tsx` is the plain header for every other page.
- Look: calm and light, after the user found the first version too packed. Snow-white paper, navy ink, with red, mustard and teal as accents, set as tokens in `src/styles.css` (`--paper`, `--ink`, `--grade-*`). Each stop has a piste shape (circle, square, diamond) and a number, so colour is never the only signal. A small skier glides beside the current stop on the desktop trail.
- Redesign spec: `redesign-spec.md` (written before the build; where it differs from the code, the code wins). Phases 1 (shell, theme, navigation, order), 2 (Getting here & away with flights and coaches, Today card, The week), 3 (Where we stay with the two smaller places, Maps in two columns, Getting around) and 4 (Things to do, FAQs, In case of trouble, Links & packing) are built, then trimmed twice for density. The Today card is its own **Daily plan** section (`daily-plan.tsx`), right after The week; `hideDailyPlanUntilTrip` in `trip.ts` hides it until 9 Jan if wanted. Keep new work lean: fewer sections, less per section, shorter copy. The redesign lives on branch `guide-redesign` (PR #19) and is not merged into `main` yet, so cbseuroski.com still shows the older single page. Things to do cards are built from `mapPoints` (so the map and the list agree); the medical centre and pharmacy are in `trouble`. Getting around lives in `gettingAround` in `trip.ts`: the resort's free shuttle, from the 2025–26 timetable until the 2026–27 one is published. Flights are in `gettingHere` in `trip.ts`, from the committee's flights sheet; the Today card and Schedule read `week` and `dayDetails`.
- All trip content lives in `src/lib/trip.ts`
- Fonts: Archivo Black for headings, Hind for body, set in `src/styles.css` and loaded in `src/routes/__root.tsx`
- Key components: `resort-map.tsx` (interactive MapLibre map on OpenFreeMap’s Positron style, pins from `mapPoints`, held inside `mapArea`, repainted for winter in `map-style.ts`, which holds the map palette; MapLibre is imported inside a `useEffect`, once the map nears the screen, because it only runs in the browser), `packing-list.tsx` (tick list saved to localStorage), `status-badge.tsx` (shows "Coming soon" and "Preliminary"), `section-intro.tsx` (the one centred title each section gets)
- `/members` (`src/routes/members.tsx`) is the signed-in area. Login is Google via Supabase Auth (`src/lib/supabase.ts`). Who gets in is decided in the database (`supabase/migrations/0001_columbia_login.sql`): `columbia.edu` and `gsb.columbia.edu`, plus the `allowed_emails` table the committee edits in the Supabase dashboard. Members-only links (WhatsApp) live in the `member_links` table, never in the repo.

## Hard rules

These apply to every change, in every phase.

1. **Price rules apply to `/archive` only; the main site shows no prices and no sign-up.** If the price block is ever shown again: one headline price, then what it covers. The headline is a single "$X" figure in US dollars for the cheapest package: the club member package, including SkiSync's 4% card fee. A small "Starting from" sits above it; a small line under it says it is per person and the club member price, then the non-member price. Underneath, two columns: *Included* and *Not included*, one line per item. Optional add-ons in *Not included* show "(from $X)", using the shortest option SkiSync offers. Every dollar figure is derived from a euro amount in `trip.ts` by one helper at one stated rate. Never show a per-person total, a cost table, or how a total is calculated.
2. **No personal contact details anywhere.** No phone numbers, personal emails, or links to anyone's personal WhatsApp chat. The contact line is: "Questions? Message the trip WhatsApp group." as plain text. The one number on the page is 112, the EU emergency number.
3. **No WhatsApp group invite link on the public page.** It goes in the `member_links` table, behind login.
4. **Games never appear on the public page.** They come back behind login, in the members area.
5. **Content lives in `src/lib/trip.ts`, not in components.** Components read from it and render whatever it holds. This will later be replaced by a Google Sheet sync, so keep the data shape clean and the read path simple.
6. **"Coming soon" and "Preliminary" are first-class states.** Use `status-badge`, which shows a badge for "Coming soon" (nothing yet) and "Preliminary" (sample data the committee has not confirmed). Confirmed and partly confirmed content displays without a badge. Unconfirmed items still display. No "last updated" timestamps.
7. **Content is partly official, partly placeholder.** Facts taken from SkiSync's official booking pages may have status `confirmed` in `trip.ts`. Nothing else may. Everything else is placeholder the committee will replace: do not rewrite, improve, or add new specifics (venues, times, prices, flight numbers) unless a task asks for it. Where a task does ask for sample specifics (event times, shuttle times, challenges), mark them `preliminary` so the badge shows, and never invent weather figures.
8. **Tone is committee-to-friends.** Warm, direct, a bit of dry humour. No corporate marketing language.
9. **Phone and desktop are both first-class.** Check every change at both widths, not one and then a shrug at the other. Give them different layouts where that serves the content — a wide screen is not a phone with more margin. Neither is the afterthought.

## Roadmap

Only work on the phase you are asked for. Do not scaffold later phases early.

- **Phase 1:** fix the build, content corrections, deploy to Vercel
- **Phase 2 (done, PR #13):** Supabase, Google login restricted to Columbia accounts (`columbia.edu`, `gsb.columbia.edu`) plus a committee-managed `allowed_emails` allowlist for +1s. `/members` gated area; old password gate removed. Still to do inside it: add the WhatsApp link as a `member_links` row once the committee has it, and bring the games back behind login.
- **Phase 3:** signed-in flight details form, one editable entry per person, stored in Supabase and synced to a committee Google Sheet
- **Phase 4:** PWA, installable, schedule and key info available offline

## Working rules

- Sessions usually run in Claude Code on the web. Work on the branch the session is already on; you can only push to that branch. Do not try to push to main.
- Commit after each completed task with a clear message. When a phase is done, open a pull request into main. One pull request per phase.
- The repo is connected to Vercel, which builds a preview link for every pull request. That preview is how the site gets checked, mostly on a phone.
- If bun is not installed in the environment, install it.
- Run the build and typecheck after changes. Fix what you break.
- Ask before adding any new dependency.
- You cannot see the page. When a check needs eyes, say so and list what to look at on the Vercel preview, on a phone and on desktop.
- End every session with a short report: what changed, files touched, anything skipped or uncertain.
