# Handoff

Snapshot for picking this project up in a new session. **CLAUDE.md is the source of truth for rules and conventions**; this file covers history, current state and what's next.

## What this is

Euro Ski ’27: the website and guide for the CBS Snow Sports trip to Val Thorens, 9–16 January 2027, around 180 people. It's a single page, and most visitors are on a phone. Bookings run through SkiSync (trip 752).

- Live: https://val-thorens-planner.vercel.app
- Repo: `javiermarazuela/val-thorens-planner`. Vercel builds a preview for every PR.

## What we've built

| PR                                                                           | What it did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#1](https://github.com/javiermarazuela/val-thorens-planner/pull/1)          | **Fixed the blank page.** `index.tsx` used `ResortMap`, `Plane` and `transfers` without importing them, so SSR threw and `server.ts` served the "This page didn't load" fallback. `vite build` doesn't typecheck, so this PR added `bun run typecheck`. It also **moved off Lovable**: `vite.config.ts` now composes TanStack Start + nitro with the `vercel` preset, where it used to emit a Cloudflare worker. And it corrected content against the hard rules (price, contact line, no games, nothing marked confirmed).                                                                                     |
| [#2](https://github.com/javiermarazuela/val-thorens-planner/pull/2)          | **Moved all page copy into `src/lib/trip.ts`** (rule 5), and deleted data that nothing rendered. **Fixed four broken valthorens.com links**: the site uses French slugs even under `/en/` (`/en/map`, `/en/ski/domaine-skiable/`, `/en/infos-neige/`, `/en/meteo/`).                                                                                                                                                                                                                                                                                                                                            |
| [#3](https://github.com/javiermarazuela/val-thorens-planner/pull/3)          | **Renamed the site "Euro Ski ’27"** everywhere: tab titles, link previews and the header wordmark. The name is one `siteName` constant, and the apostrophe is U+2019. **Rewrote CLAUDE.md rule 9**: phone and desktop are both first-class. Deleted a dead component.                                                                                                                                                                                                                                                                                                                                           |
| [#4](https://github.com/javiermarazuela/val-thorens-planner/pull/4)          | **Separate phone and desktop layouts.** The phone page is 15% shorter, with tighter padding and two-column grids; desktop gets wider containers and a three-column guide. **Real interactive map:** Leaflet on OpenStreetMap tiles, replacing a decorative SVG. It has icon pins (house, gondola, fork, glass) in four colours, and tapping a pin or name opens a card with a linked title and "Open in Google Maps". Adds the only new dependency, `leaflet`.                                                                                                                                                  |
| [#5](https://github.com/javiermarazuela/val-thorens-planner/pull/5) **open** | **Official SkiSync information.** The price section shows "From $2,083 per person" (club member package), the non-member price, _Included_ / _Not included_ columns with add-on "from" prices, a **Sign up on SkiSync** button, and a **Key dates** strip (10, 20 and 26 Dec). It corrects copy SkiSync contradicts: you book your own flights, the club doesn't run the coaches, roommates are chosen at registration rather than drawn on arrival, and the passport rule is now in. It adds four confirmed FAQs, and updates CLAUDE.md rules 1 and 7 plus a context line. This HANDOFF.md is also on this PR. |

## Current state

- **Branch:** `claude/repo-exploration-assessment-56j32y`. It is ahead of `main` by PR #5's commits.
- **`main`:** PR #4 merged (`29fa81a`). This is what's live.
- **PR #5 is open** and its preview built successfully. It's waiting on a phone check (price block, the two columns, the sign-up button opening SkiSync, key dates) and then a merge.
- **Checks on the branch:** typecheck clean, lint 0 errors (6 harmless warnings), build clean on `preset: vercel`.

## Open issues and unverified items

- **Map pin coordinates are approximate.** They're carried over from the old diagram's layout onto the real resort centre (45.298N, 6.580E), and the page says so. The committee should put real lat/lng into `mapPoints` in `trip.ts`. The Google Maps links search **by name**, so they reach the real venue even while a pin is off.
- **Never checked in a browser:**
  - the four corrected valthorens.com links
  - the OpenStreetMap tiles

  The cloud sandbox blocked both domains, so every test render showed pins on a grey background. Check both locally, and check the live site.

- **SkiSync unknowns** (committee to confirm):
  - Only **4-day** lift passes and rentals appeared in the screenshots. Shorter options would lower the "from $362 / $147 / $21" figures.
  - SkiSync's transfer policy contains **unfilled template text** ("Between Month Day, Year and…"). Only the dates it does give are used.
  - The terms mention a **"Social Only" ticket**, possibly how +1s join. It's left off the site.
  - The sign-up URL includes the club's `cbssnowsports27` gmail as a referral code, visible to anyone who looks.
- **Airport:** Geneva (GVA) is still only "likely", and the shuttle is "coming soon" until SkiSync publishes times.
- **Stale docs:**
  - CLAUDE.md's _Structure_ section still describes `resort-map.tsx` as an "SVG schematic map"; it's Leaflet now.
  - `README.md` still contains the old Lovable-era prompt text above _Development_.
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
- **Leaflet is browser-only.** It touches `window`, so it's dynamically imported inside a `useEffect` in `resort-map.tsx`. Keep it there, or server-side rendering breaks. It ships as its own lazy chunk and CSS file.
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

1. **Phone-check and merge PR #5.**
2. **Confirm the SkiSync unknowns with the committee:** shorter pass/rental options, the Social Only ticket, and the transfer-policy text. Then update `trip.ts`.
3. **Real map coordinates** from the committee, into `mapPoints`.
4. **Fix the two stale doc lines:** the CLAUDE.md map description and the README prompt text.
5. **Phase 2 is blocked on decisions only you can make:**
   - Create a Supabase project and add its keys to Vercel.
   - Decide whether the gated area (games, WhatsApp link) is a new `/members` route or a section revealed on the single page once signed in. CLAUDE.md documents a single page, so either choice changes the stated architecture.
   - Phase 2 then covers Google login restricted to `columbia.edu` / `gsb.columbia.edu`, plus the +1 allowlist, and it removes `src/lib/guide.functions.ts`.
6. **Later:** phase 3 is the flight details form; phase 4 is the PWA (its manifest name should read from `site.name`). Only when asked.
