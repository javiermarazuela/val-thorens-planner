# Euro Ski '27 guide redesign: build spec

## Context

The trip is sold out, so the site is now a guide used in resort, mostly on phones. Claude Design's v2 (`Euro Ski 27 Claude design directions/Euro Ski 27 Guide v2.dc.html`) has a good structure and new content (flights, Today card, shuttle blocks) but a generic look, fake map pins and invented times. The current site (`val-thorens-planner/`) has the real map, real content rules and photos but an older single-page layout. This spec merges them: v2's structure and new content, the current site's real map and data discipline, and the retro-poster look from the user's reference images (`uploads/pasted-*.png`: vintage Fischer badge, red/mustard/navy/teal palette, "Spend the day skiing" poster).

> **Status (6 Oct 2026):** built on branch `guide-redesign` (PR #19), not merged, then trimmed for density after the user found it too packed. This spec is the original plan; where it differs (a separate Daily plan section for the Today card, calmer snow-white palette, simpler Getting here, no `guide-rail.tsx`/`section-chips.tsx`/`section-order.ts` files), the code and CLAUDE.md win.

## Decisions already made with the user

- **Look:** a mix. Keep v2's clean layout and alternating section bands. Add the retro references: cream paper, red / mustard / navy / teal palette, badge-shaped section numbers, light grain, an illustrated header.
- **Navigation:**
  - Desktop: fixed left rail, a trail line with numbered stops in piste shapes (circle = green, square = blue, diamond = red/black), a marker that follows the scroll, finished stops filled in, click to jump.
  - Phone: v2's scrolling chip bar plus a thin progress line. No vertical rail.
  - Both: slim top bar with site name and current section.
- **Order switches by date:**
  - Before 9 Jan 2027 (journey order): Welcome, Getting here & away, Where we stay, Schedule, Maps, Getting around, Things to do, FAQs, In case of trouble, Links & packing.
  - From 9 Jan 2027 (in-trip order): Welcome + Today, Schedule, Maps, Getting around, Where we stay, Getting here & away, Things to do, FAQs, In case of trouble, Links & packing.
- **Getting here & away is one section**, flights block first, then airport coach, check-in, check-out.
- **Today card** (day picker, events, next bus, weather and snow, challenge of the day) sits under the welcome, not buried in Schedule. No-login version only; leave the "your details" tile as a dashed placeholder.
- **Where we stay:** Village Montana is the main card (most people). Two small cards for Hotel L'Oxalys and Hotel Le Hameau du Kashmir.
- **Photo cards** in Things to do and beside the FAQs.
- **Maps:** keep the real winter MapLibre map, the Val Thorens ski map image and the two PDF downloads already built. Do not use v2's fake pins.
- **Unconfirmed content** uses sample data with a "Preliminary" badge until the user supplies real data. Hard rule 7 and 6 get updated to allow this.
- Phone and desktop are both first-class (rule 9). No new dependencies.

## Section list (ids, in both orders)

| id | Section | Source | Notes |
|---|---|---|---|
| welcome | Welcome + Today card | v2 + new | Hero photo, dates, "170 of us", Today card with day picker |
| getting-here | Getting here & away | v2 flights + current | Flights, airport coach, check-in, check-out |
| stay | Where we stay | current `stay` | Main card + two smaller hotel cards |
| schedule | Schedule | v2 day cards | 9 days: arrival, 6 theme days, departure; tap a day to drive the Today card |
| maps | Maps | current `ResortMap` + ski map | Side by side on desktop, stacked on phone |
| around | Getting around | v2 shuttle blocks | Up the mountain / Home & après toggle, next departures |
| todo | Things to do | v2 cards + current content | Category filter, photo cards |
| faqs | FAQs | current `faqs` + v2 style | Accordion with photo beside it on desktop |
| trouble | In case of trouble | v2 | 112 big, doctor, pharmacy, WhatsApp line (plain text, rule 2) |
| links | Links & packing | current `PackingList` + links | Webcams, snow report, official site |

## Implementation plan

### 1. Data (`src/lib/trip.ts`)
All content stays here (rule 5). Add typed arrays, each item with a `status` that can be `"confirmed" | "partial" | "soon" | "preliminary"`:
- `journeyOrder` and `tripOrder` arrays of section ids; one `sectionMeta` map (id, label, grade, short label).
- `days` (9 entries: date, theme, sub, events, next-bus text, challenge). Weather/snow fields optional.
- `flights`: out and home lists with recommended flags and coach group, converted from `Euro Ski 27 Claude design directions/uploads/Euro Ski 27 Flights.xlsx` and checked against v2's `FL_OUT` / `FL_HOME` / `RECS` constants. `flightAlternatives` (Lyon, Paris train, Geneva on your own).
- `gettingAround` lines and times, `travelSteps`, `places` (restaurants/activities), `emergency`, `links`.
- `stays`: Village Montana (existing), Hotel L'Oxalys (photo in `Images/Résidence L'Oxalys_1.jpg`), Hotel Le Hameau du Kashmir (no photo yet; Preliminary placeholder).
- Remove `pricing`, `keyDates`, `resortIntro`, `resortFacts` from the main flow if unused (they live on `/archive`).

### 2. Theme (`src/styles.css`)
Define CSS variables for the retro palette (cream, navy ink, red, mustard, teal, mint), section band tokens, badge shape utilities and a subtle grain. Fonts stay Archivo Black and Hind (`__root.tsx`); revisit the display font only if the retro look needs it. Keep contrast AA and never use colour alone for state.

### 3. Shell and navigation
- New `src/components/guide-rail.tsx` (desktop trail), `section-chips.tsx` (phone), update `site-header.tsx` (top bar with progress line, current section).
- `src/lib/use-scroll-spy.ts`: IntersectionObserver-based, returns current section index and scroll progress; respects `prefers-reduced-motion` for smooth scroll.
- `src/lib/section-order.ts`: picks `journeyOrder` or `tripOrder` by date (client-side, compared to 9 Jan 2027 in Europe/Paris). A `?order=trip|journey` query override for testing. Server render uses the order for "today" and re-checks on the client, so SSR and hydration agree.
- `src/routes/index.tsx` renders sections by iterating the chosen order through a `sectionRegistry` map (id to component), each wrapped in a new `GuideSection` (shared heading, number badge, band colour, `data-sec`).

### 4. Section components (`src/components/sections/`)
`welcome-today.tsx`, `getting-here.tsx` (with `flight-list.tsx`), `stay.tsx`, `schedule.tsx`, `maps.tsx` (wraps existing `resort-map.tsx` and the ski map block already in `index.tsx`), `getting-around.tsx`, `things-to-do.tsx`, `faqs.tsx`, `trouble.tsx`, `links-packing.tsx` (reuses `packing-list.tsx`). Reuse `section-intro.tsx` styling ideas, `status-badge.tsx` (extend), `googleMapsUrl()` in `trip.ts`, `ResortMap`, `PackingList`.

### 5. Status badge
Extend `status-badge.tsx` and `GuideStatus` with `"preliminary"` (visible badge), alongside the existing "Coming soon". Update CLAUDE.md rules 6 and 7 to say sample data is allowed only with a Preliminary badge, and update the Structure section for the new layout.

### 6. Today card
Day picker defaults to the real current day during 9–16 Jan, otherwise to Day 1 with a countdown before the trip. Weather and snow: sample until a live source is chosen (open question below); show Preliminary.

## Open items and blockers

1. **Coaches:** does SkiSync or the committee run airport coaches? HANDOFF says the club does not. v2 shows coach times 08:30 / 10:30 / 14:15 (outbound) and 05:15 / 07:30 / 09:30 (return) as TBC. Until answered, show them as Preliminary, and keep the "you'll book this leg yourself" wording only where SkiSync confirms it.
2. **Live weather/snow source:** needs a keyless option or the user's choice; sample data with Preliminary until then.
3. **Hotel details:** photo, address and check-in info for Hotel Le Hameau du Kashmir; address and check-in for L'Oxalys.
4. **Photos:** hero, Getting around, FAQs, Things to do; v2 uses empty image slots.
5. **Real data to replace samples:** shuttle times, event times, theme days, restaurants, rental shops, doctor and pharmacy.
6. **Display font** may change if the retro direction needs it.

## Build phases (one pull request per phase, per CLAUDE.md)

1. Theme tokens, `GuideSection`, section registry, order switching, rail, chip bar, top bar (existing content rendered inside the new shell).
2. Getting here & away with flights; Today card and Schedule.
3. Stay, Maps, Getting around.
4. Things to do, FAQs, Trouble, Links & packing; photos.
5. Preliminary badge rules in CLAUDE.md; swap sample data for real as it arrives.

## Verification

- `bunx tsc --noEmit`, `bun run lint`, `bun run build` (look for `preset: vercel`) after each phase.
- Run the dev server and check in the browser pane at phone width (375) and desktop (1280+): rail follows the scroll and jumps on click; chips scroll the current one into view; progress line moves; both orderings render (test with `?order=trip` and `?order=journey`); the Today card day picker works; the map loads and the ski map PDFs download; packing ticks persist; no horizontal scroll; focus outlines and 44px tap targets present.
- Check `prefers-reduced-motion` and dark-on-cream contrast.
- Confirm no prices or sign-up on the main page, no personal contact details, no invented specifics without a Preliminary badge.
- Vercel preview checked on a real phone before merge.
