# Handoff

Snapshot for picking this project up in a new session. **CLAUDE.md is the source of truth for rules and conventions**; this file covers history, current state and what's next.

## What this is

Euro Ski ’27: the website and guide for the CBS Snow Sports trip to Val Thorens, 9–16 January 2027, 170+ people. The trip has sold out, so it is now a scroll-through guide, and most visitors are on a phone. Bookings run through SkiSync (trip 752). The original sign-up and price page is kept at `/archive`.

- Live: https://cbseuroski.com (`www` redirects to it). The old https://val-thorens-planner.vercel.app still works.
- Repo: `javiermarazuela/val-thorens-planner`. Vercel builds a preview for every PR.

## What we've built

| PR                                                                  | What it did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1](https://github.com/javiermarazuela/val-thorens-planner/pull/1) | **Fixed the blank page.** `index.tsx` used `ResortMap`, `Plane` and `transfers` without importing them, so SSR threw and `server.ts` served the "This page didn't load" fallback. `vite build` doesn't typecheck, so this PR added `bun run typecheck`. It also **moved off Lovable**: `vite.config.ts` now composes TanStack Start + nitro with the `vercel` preset, where it used to emit a Cloudflare worker. And it corrected content against the hard rules (price, contact line, no games, nothing marked confirmed).                                                                                     |
| [#2](https://github.com/javiermarazuela/val-thorens-planner/pull/2) | **Moved all page copy into `src/lib/trip.ts`** (rule 5), and deleted data that nothing rendered. **Fixed four broken valthorens.com links**: the site uses French slugs even under `/en/` (`/en/map`, `/en/ski/domaine-skiable/`, `/en/infos-neige/`, `/en/meteo/`).                                                                                                                                                                                                                                                                                                                                            |
| [#3](https://github.com/javiermarazuela/val-thorens-planner/pull/3) | **Renamed the site "Euro Ski ’27"** everywhere: tab titles, link previews and the header wordmark. The name is one `siteName` constant, and the apostrophe is U+2019. **Rewrote CLAUDE.md rule 9**: phone and desktop are both first-class. Deleted a dead component.                                                                                                                                                                                                                                                                                                                                           |
| [#4](https://github.com/javiermarazuela/val-thorens-planner/pull/4) | **Separate phone and desktop layouts.** The phone page is 15% shorter, with tighter padding and two-column grids; desktop gets wider containers and a three-column guide. **Real interactive map:** Leaflet on OpenStreetMap tiles, replacing a decorative SVG. It has icon pins (house, gondola, fork, glass) in four colours, and tapping a pin or name opens a card with a linked title and "Open in Google Maps". Adds the only new dependency, `leaflet`.                                                                                                                                                  |
| [#5](https://github.com/javiermarazuela/val-thorens-planner/pull/5) | **Official SkiSync information.** The price section shows "From $2,083 per person" (club member package), the non-member price, _Included_ / _Not included_ columns with add-on "from" prices, a **Sign up on SkiSync** button, and a **Key dates** strip (10, 20 and 26 Dec). It corrects copy SkiSync contradicts: you book your own flights, the club doesn't run the coaches, roommates are chosen at registration rather than drawn on arrival, and the passport rule is now in. It adds four confirmed FAQs, and updates CLAUDE.md rules 1 and 7 plus a context line. This HANDOFF.md is also on this PR. |

## Guide redesign (PR #19, merged)

- The trip sold out, so the site became a trip guide: one scrolling page of numbered sections (Welcome, Getting here & away, Where we stay, The week, Daily plan, Maps, Getting around, Things to do, FAQs, In case of trouble, Links & packing). Order is journey order until 9 Jan 2027, trip order after (`?order=trip|journey` forces one). Spec: `redesign-spec.md`; structure notes: CLAUDE.md.
- Phases 1-4 built (fce938b), TanStack Start bumped to 1.168.60 to clear a Vercel XSS block (809d8f1), then two density passes after the user called the first preview too packed (c0f00fa, efad841), then a calmer palette, simpler Getting here, stay photos and a skier on the desktop trail (a622554).
- **Merged and live** (later PRs added the week, the map popup and the Getting around shuttle map).
- New content in `trip.ts` since this file's last update: `gettingHere` (flights from the committee's flights sheet), `airportCoaches`, `checkSteps`, `otherRoutes`, `gettingAround` (resort shuttle on the 2025-26 timetable until 2026-27 is published), `dayDetails` (preliminary), `thingsToDo`, `trouble`, `linksSection`, and the two smaller stays (L'Oxalys, Le Hameau du Kashmir) with photos in `src/assets/`.
- Still sample (`preliminary`): day events and times, challenges, weather, shuttle times, airport coach times. Replace as the committee confirms.
- Read on 7 Oct from the parent folder's `Info/`: the Master Tracker's calendar now drives the evening events in `week` and `dayDetails` (welcome drinks Sat; après Mon, Thu, Fri; club nights Tue and Fri; bar crawl Wed; still preliminary, no venues or times). Its venue list already matches `mapPoints`. The rest of the tracker (budget, payments, prior-year Tignes venues, committee comments on venues) is internal and deliberately kept out of the site. The Telegraph guide added only the Chambéry and Moûtiers travel facts in `otherRoutes`.

## Phase 2: Google login (done, PR #13)

- **Who gets in:** `columbia.edu` and `gsb.columbia.edu`, plus exceptions in the Supabase `allowed_emails` table (Table Editor → Insert row, email in lowercase). It is enforced in the database by a sign-up trigger and row level security, not in the browser. Removing someone from `allowed_emails` locks them out at once. Schema: `supabase/migrations/0001_columbia_login.sql`.
- **Code:** `src/routes/members.tsx` (client-only, `ssr: false`), `src/lib/supabase.ts`, `src/routes/privacy.tsx` (copy in `privacy` in `trip.ts`), and a Members button in the header. `guide.functions.ts` is deleted.
- **Setup outside the repo:**
  - Supabase project `lturqfowogbkedhldhop`: Google provider on, Email off.
  - Google Cloud project `euro-ski`: external, in production, basic scopes only (so the 100-user cap doesn't apply), with the Supabase callback as its redirect URI.
  - Vercel env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, with Config visibility because `VITE_` values are public.
  - `cbseuroski.com` verified in Google Search Console.
- **Tested:** a Columbia account signs in and sees the members page. A personal Gmail is rejected, and an address added to `allowed_emails` gets in (both checked). The remove-then-locked-out step is not yet checked. To add many people at once, run `supabase/add_allowed_emails.sql` in the SQL Editor.
- **Gotchas:**
  - "Unable to exchange external code" on return means the Google client ID or secret in Supabase is wrong.
  - `redirect_uri_mismatch` means the Google client's redirect URI isn't exactly `https://lturqfowogbkedhldhop.supabase.co/auth/v1/callback`.
  - `/members` shows its generic "isn't on the list" message for any sign-in error. Read `error_description` in the URL or the Supabase Auth logs to find the real cause.
  - Supabase's redirect URLs must include every address sign-in can return to.

## Chatbot: Julian the snowman (state on 21 Oct 2026)

Rules and structure are in CLAUDE.md (the chatbot entry, rules 10 and 11). Design decisions came from the user: a hybrid, but since 21 Oct the free tier answers only the default questions (chips and knowledge-row questions, exact match) and Haiku handles every other typed question for signed-in people, because keyword matching misread multi-part questions; each question stands alone; playful trip-leader tone, English only; relevant but unknown questions say "message us on the trip WhatsApp group"; signed-out visitors get the default questions only, with "please sign in for more complex questions"; three off-topic questions in a row means a 24-hour ban.

**Branches** (`chatbot`, `chatbot-ai` and `testdata` are pushed; `chatbot-foundations` is contained in them):

| Branch | What it holds |
| --- | --- |
| `chatbot-foundations` | Step 1: `0006_chatbot.sql`, the sheet publisher (`knowledge-sheet.gs`) and the starter CSV tabs |
| `chatbot` | Step 2a: the free tier, Julian, `appNow()` |
| `chatbot-ai` | Step 2b: Haiku, strikes, caps, logging, `0007_chatbot_guard.sql`. **Open the pull request to `main` from this branch** (it contains the two above) |
| `testdata` | `chatbot-ai` plus the test site: 200 fake travellers, the `/testdata` picker, the pretend clock, the test chat environment. Never merge into `main` |

**Done outside the repo:** migrations `0006` and `0007` run in Supabase; an Anthropic workspace with a $20 monthly limit, its key set in Vercel as `ANTHROPIC_API_KEY`; `test.cbseuroski.com` assigned to the `testdata` branch in Vercel (Domains, Preview, branch `testdata`) with a DNS-only CNAME in Cloudflare.

**21 Oct 2026 (test site, commit `2bbf686` on `testdata`, not on `chatbot-ai` or `main`):** free text goes to Haiku, which now also sees the week, places, activities, the person's team and the leaderboard. Checked on test.cbseuroski.com with five questions: a two-part Wednesday club night question, an unknown guest question, a snow-day idea, an off-topic question (one strike) and a wifi question all behaved. Not yet checked: the daily caps and the 24-hour ban. Port the change to `chatbot-ai` before the real pull request.

## Crew and the test site (21 Oct 2026)

`/crew` (flights, teams, slopes) is live on main (PR #36); see the Crew entry in CLAUDE.md. Migrations `0008` to `0011` have all been run. Still to do on the real site: load the teams CSV with `scripts/allocate-teams.ts` (needs year, gender and residence per person), add the user's email to `admins`, promote Julian's team answers once `chatbot-ai` merges, and decide the final challenge list.

The test site (`test.cbseuroski.com`, branch `testdata`) was walked through in a browser on 21 Oct as a test persona: `/testdata`, the home page, all three Crew tabs, Julian's chips and free text all worked. `/demo` (guest sign-up through Google) was not clicked through. The one console error is React #418, the harmless pretend-clock hydration warning. `testdata` is 9 commits behind `main` (the same Crew code under other hashes), so merging main in may conflict in the schedule, today-card and welcome sections. Wifi and some other answers on the test site come from invented `src/test-data/knowledge-fill.json`.


**Not done yet:**

- The committee's Google Sheet: import `supabase/sheet-sync/templates/*.csv` as tabs, paste `knowledge-sheet.gs`, set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Script Properties, fill the rows, then Chatbot, Publish to site. Until then Julian uses the bundled starter rows and the guide FAQ.
- The real Rooms and Shuttles sheets (matched by Columbia email). The Shuttles columns were invented, so check them against the real sheet. Flights already come from the `flights` table.
- Checking the AI tier end to end on the test site: the Haiku request (written without a key to test against), the strike and ban messages, and the daily caps. A failure shows as "Julian's brain is taking a snow nap"; read the Vercel function log.
- A line on the privacy page about the anonymous question log (promised, not written).
- Roommate names on the real site: the real tables have no roommates column; the test site shows them.
- After a day of testing, read `chat_log` in Supabase. Rows with outcome `unknown` show what to fill in first.

**Gotchas:**

- Shell heredocs with apostrophes broke twice; write files with the editor tool.
- A regex written inside a non-raw Python string turned `\b` into a backspace character; ESLint's `no-control-regex` catches it.
- `bun run lint` reports hundreds of prettier line-ending errors repo-wide on Windows; format only the files you touch.
- The test site logs one harmless hydration warning, because the pretend date changes which sections come first.

## Current state

- **`main`:** the older single-page site; everything through PR #12 plus the later Supabase and hotel changes is merged and live, including the phone-first cleanup (shorter hero, Gamma-style price block, 170+). The members page has a "Back to Euro Ski ’27" link.
- **Where we stay: Résidence Village Montana** (453 Rue du Soleil, 73440 Les Belleville), "for now" per the committee, so its status stays `partial`. The photo is the residence's own marketing image.

- **Map venues:** categories are Après, Bars, Clubs and Restaurants (colours in `mapKinds`, `trip.ts`). Venue pins were checked against OpenStreetMap and Google Maps on 30 Sep 2026. Saloon and Igloo de Thorens are not in OSM, so they use Google's position. Left off the map: Clos Bernard (the only Google match is in Méribel, about 7 km north) and Chez Pépé Nicolas (on the D117 road, just outside `mapArea`).

## Open issues and unverified items

- **Map pin coordinates are approximate, except the residence and three lifts.** Village Montana is at its OpenStreetMap position (45.29731, 6.57608). Funitel Péclet, Plein Sud and the Caron gondola (renamed from "Cime Caron cable car", which starts outside the map at the top of that gondola) sit on their village stations, taken from OSM's lift lines. Beginner carpets and the lunch and bar pins are carried over from the old diagram's layout onto the real resort centre (45.298N, 6.580E), and the page says so. The committee should put real lat/lng into `mapPoints` in `trip.ts`. The Google Maps links search **by name**, so they reach the real venue even while a pin is off.
- **Checked in a local browser** (the cloud sandbox blocks both domains):
  - The valthorens.com links all open the right English pages. `/en/map` turned out to redirect to the French resort map, so it now points at `/en/decouvrir/plan-station/`.
  - The map now runs on MapLibre with OpenFreeMap’s keyless Positron style (CARTO’s Positron needs a key since September 2026).

- **SkiSync, resolved:** 4 days is the minimum for passes and rentals, so the "from" prices stand. There are no Social Only tickets. The unfilled "Month Day, Year" text in the transfer policy is leftover boilerplate and is ignored.
- **Referral code:** the sign-up URL includes the club's `cbssnowsports27` gmail as a referral code, visible to anyone who looks.
- **Airport:** Geneva (GVA) is still only "likely", and the shuttle is "coming soon" until SkiSync publishes times.
- **Lint warnings:** six `react-refresh/only-export-components` warnings in shadcn `src/components/ui/*`. Harmless.
- **Trimmed:** the 45 unused shadcn components (only `src/components/ui/button.tsx` is left), `use-mobile`, and 36 unused packages (`recharts`, `embla-carousel`, `react-day-picker`, `react-hook-form`, `zod`, most `@radix-ui/*`, …). If you need a shadcn component later, add it back then (`components.json` is still set up).

## Key decisions and conventions

- **Content lives in `src/lib/trip.ts`; components only render it** (rule 5). Examples:
  - `site`, `hero`, `pricing`, `keyDates`, `faqs` (whose `featured` flag picks what shows), and `mapPoints`.
  - `googleMapsUrl()` builds the links.
- **Money:**
  - Euro amounts are the source of truth.
  - `usd(eur)` converts them at `money.eurToUsd = 1.18`, including `money.cardFee = 0.04`. That rate is SkiSync's own: their checkout shows €2,071.68 as $2,444.58.
  - The headline is the cheapest package (club member, €1,697 → $2,083).
  - Add-ons show "from $X" using the shortest option.
  - No per-person total and no cost table (rule 1).
- **Badges:** "Confirmed" only for facts taken from SkiSync's official pages (rule 7). Placeholder content stays "Partly confirmed" or "Coming soon".
- **Map colours:**
  - stay blue `#2563eb`, lifts green `#10b981`, lunch orange `#f59e0b`, drinks & bars red `#b91c1c`
  - Red was chosen over purple by measurement: purples collapse into the stay blue under red-green colour blindness.
- **MapLibre is browser-only.** It needs `window` and WebGL, so `resort-map.tsx` imports it inside a `useEffect`, once the map is within 800px of the screen (it is ~430 KB gzipped, worker included). Keep it there, or server-side rendering breaks and every visitor pays for the map. Its worker is imported with Vite’s `?worker&url` and passed to `setWorkerUrl`, because MapLibre’s own lookup expects files Vite moves. The map is held inside `mapArea.bounds` in `trip.ts`, and water, road-shield and airport labels are filtered out of the style before it draws.
- **Map palette (winter):** `src/components/map-style.ts` fetches Positron and repaints it before the map draws. The mountainsides OSM maps as grassland, bare rock or scree are white snow; land with no land-cover data (mostly the valley floor and around the village) is grey `#e2e7ed`. Lakes and streams are blue, and the village and buildings are warm beige so they read apart from both. The grey Vanoise national park fill is switched off.
  - Ski lifts are grey dashed lines (`#64748b`) with their names along them in darker slate, quiet under the coloured pins.
  - The tiles have lift names but no "VT3" numbers, and no pistes, so neither can be shown.
- **Contact:** the only contact line is "Questions? Message the trip WhatsApp group." No phone numbers anywhere, which is why SkiSync's 855 number is left out (rule 2).
- **Build output** is `.vercel/output`, ignored by git, eslint and prettier.
- **Before pushing:** `bun run typecheck`, `bun run lint` (expect 0 errors), `bun run build` (look for `preset: vercel`).
- **Local dev:** `bun install`, then `bun run dev`. `bun run preview` doesn't work with the nitro output; to check SSR, import `.vercel/output/functions/__server.func/index.mjs` and call its `fetch` with a `Request`.
- **Verification habits:**
  - Check layout at **390px and 1440px**; Playwright works well for this.
  - Measure page height and horizontal overflow before and after a change.
  - Sweep the rendered HTML against the hard rules: no phone number, no games, no WhatsApp link, and no "Confirmed" outside SkiSync facts.
- **Git:**
  - One PR per piece of work; merge commits, not squash.
  - Once a PR merges, restart the branch from `main` rather than stacking on merged history.
  - Commit messages explain _why_.

## Next steps

1. **Real map coordinates** from the committee, into `mapPoints`.
2. **Finish phase 2:** check that removing an `allowed_emails` row locks that person out. Add the WhatsApp link as a `member_links` row once someone who administers the group has it. Bring the games back behind login.
3. **Later:** phase 3 is the flight details form; phase 4 is the PWA (its manifest name should read from `site.name`). Only when asked.
