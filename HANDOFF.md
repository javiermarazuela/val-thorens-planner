# Handoff

Snapshot for picking this project up in a new session. **CLAUDE.md is the source of truth for rules and conventions**; this file covers history, current state and what's next.

## What this is

Euro Ski ’27: the website and guide for the CBS Snow Sports trip to Val Thorens, 9–16 January 2027, 170+ people. It's a single page, and most visitors are on a phone. Bookings run through SkiSync (trip 752).

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

## Phase 2: Google login (done, PR #13)

- **Who gets in:** `columbia.edu` and `gsb.columbia.edu`, plus exceptions in the Supabase `allowed_emails` table (Table Editor → Insert row, email in lowercase). It is enforced in the database by a sign-up trigger and row level security, not in the browser. Removing someone from `allowed_emails` locks them out at once. Schema: `supabase/migrations/0001_columbia_login.sql`.
- **Code:** `src/routes/members.tsx` (client-only, `ssr: false`), `src/lib/supabase.ts`, `src/routes/privacy.tsx` (copy in `privacy` in `trip.ts`), and a Members button in the header. `guide.functions.ts` is deleted.
- **Setup outside the repo:**
  - Supabase project `lturqfowogbkedhldhop`: Google provider on, Email off.
  - Google Cloud project `euro-ski`: external, in production, basic scopes only (so the 100-user cap doesn't apply), with the Supabase callback as its redirect URI.
  - Vercel env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, with Config visibility because `VITE_` values are public.
  - `cbseuroski.com` verified in Google Search Console.
- **Tested:** a Columbia account signs in and sees the members page. A personal Gmail is rejected (checked). Not yet tested: an `allowed_emails` exception.
- **Gotchas:**
  - "Unable to exchange external code" on return means the Google client ID or secret in Supabase is wrong.
  - `redirect_uri_mismatch` means the Google client's redirect URI isn't exactly `https://lturqfowogbkedhldhop.supabase.co/auth/v1/callback`.
  - `/members` shows its generic "isn't on the list" message for any sign-in error. Read `error_description` in the URL or the Supabase Auth logs to find the real cause.
  - Supabase's redirect URLs must include every address sign-in can return to.

## Current state

- **`main`:** everything through PR #12 is merged and live, including the phone-first cleanup (shorter hero, Gamma-style price block, 170+). The members page has a "Back to Euro Ski ’27" link.
- **Where we stay: Résidence L’Oxalys** (Entrée station, 73440 Val Thorens), "for now" per the committee, so its status stays `partial`. The photo is a Val Thorens marketing image, cropped to keep its logos out of frame; swap it if the committee has one of its own.

## Open issues and unverified items

- **Map pin coordinates are approximate, except the residence and three lifts.** L’Oxalys is at its OpenStreetMap position (45.29784, 6.57711). Funitel Péclet, Plein Sud and the Caron gondola (renamed from "Cime Caron cable car", which starts outside the map at the top of that gondola) sit on their village stations, taken from OSM's lift lines. Beginner carpets and the lunch and bar pins are carried over from the old diagram's layout onto the real resort centre (45.298N, 6.580E), and the page says so. The committee should put real lat/lng into `mapPoints` in `trip.ts`. The Google Maps links search **by name**, so they reach the real venue even while a pin is off.
- **Checked in a local browser** (the cloud sandbox blocks both domains):
  - The valthorens.com links all open the right English pages. `/en/map` turned out to redirect to the French resort map, so it now points at `/en/decouvrir/plan-station/`.
  - The map now runs on MapLibre with OpenFreeMap’s keyless Positron style (CARTO’s Positron needs a key since September 2026).

- **SkiSync, resolved:** 4 days is the minimum for passes and rentals, so the "from" prices stand. There are no Social Only tickets. The unfilled "Month Day, Year" text in the transfer policy is leftover boilerplate and is ignored.
- **Referral code:** the sign-up URL includes the club's `cbssnowsports27` gmail as a referral code, visible to anyone who looks.
- **Airport:** Geneva (GVA) is still only "likely", and the shuttle is "coming soon" until SkiSync publishes times.
- **Lint warnings:** six `react-refresh/only-export-components` warnings in shadcn `src/components/ui/*`. Harmless.
- **Unused packages:** 46 shadcn `ui/` components and heavy libraries (`recharts`, `embla-carousel`, `react-day-picker`, …) are installed while the page uses only `button`. Worth trimming, but ask first (CLAUDE.md: ask before changing dependencies).

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
2. **Finish phase 2:** test an `allowed_emails` exception. Add the WhatsApp link as a `member_links` row once someone who administers the group has it. Bring the games back behind login.
3. **Later:** phase 3 is the flight details form; phase 4 is the PWA (its manifest name should read from `site.name`). Only when asked.
