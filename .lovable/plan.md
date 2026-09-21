# Val Thorens 2027 — one-page, story-first rebuild

## The change

Drop the Trip/Guide split. One long scrolling page, told in the order a member actually
asks questions: what is this → why Val Thorens → where we stay → the week → on the hill →
if you're not skiing → what to pack → what it costs and how to book → the boring-but-vital
answers. Warm alpine visuals, icy blue with timber contrast, human voice throughout.

Navigation becomes a single sticky bar with section jumps (Resort, Chalet, The week,
Non-skiers, Packing, Price, FAQs) that collapses to a compact menu on phones.

## Page flow

1. **Hero** — Val Thorens, 9–16 January 2027, 179 of us, one line of real voice, two
   buttons: Book your place / See the week.
2. **Why here** — 2,300m, 600km linked in Les 3 Vallées, 150km locally, ski-in ski-out,
   compact and pedestrian. Three hours from Geneva or Lyon, two from Chambéry.
3. **Where we stay** — accommodation section with photo, location description and a link to
   the resort map. Room allocation explained honestly. Marked "still being confirmed" where
   it is.
4. **The week** — Saturday-to-Saturday calendar: eight day cards with arrival, ski days,
   theme nights, departure. Each card shows what's confirmed and what's still being planned.
5. **On the mountain** — piste map link, lift basics, gear rental for anyone who didn't
   pre-book, how to reach the slopes on the first morning, lessons for beginners.
6. **Not skiing?** — a full daytime programme presented as its own draw, not a footnote.
7. **What to pack** — a real checklist grouped into On the mountain / Evenings /
   Documents & essentials, with ticks saved in the browser so it survives a page refresh.
8. **Price and booking** — cost, what's included, payment dates, and the booking button.
   Until you give me the real numbers this stays a clearly-marked "confirmed soon" block
   with the booking link ready to drop in.
9. **Answers** — check-in/check-out, flights, cash, insurance, lift pass, getting home from
   the clubs, plus organiser contacts and an urgent-help line.
10. **Footer** — dates, last-updated date, contacts.

## Forthcoming content

Same three honest states as before — Confirmed, Partly confirmed, Coming soon — but now
inline within each section rather than on separate pages. One visible "Last updated" date in
the hero and footer. I will not invent prices, venues, transfer times, flights or
inclusions.

## Password later

The sensitive material (door codes, rooming lists, WhatsApp links, transfer assignments)
stays behind the existing dormant server boundary and renders as a locked block inside the
relevant sections. Turning it on later needs a password, a session secret and an unlock
screen — no restructuring.

## What I'm removing

The `/guide` home and the nine `/guide/$slug` pages, and the Trip/Guide toggle in the
header. Their content moves into the sections above. Old guide URLs redirect to the
matching section anchor so anything already shared in WhatsApp still lands somewhere useful.

## Technical notes

- Single content route at `src/routes/index.tsx`, composed from section components under
  `src/components/sections/`.
- Content stays in one structured source (`src/lib/trip.ts` extended with resort, chalet,
  week, packing, faq and pricing data) so statuses and dates stay consistent.
- Guide data moves out of `src/lib/guide.functions.ts` into the shared content module;
  the server function is kept only for the future protected content, preserving the
  dormant `requireGuideAccess` gate.
- Packing checklist state in `localStorage`, read after hydration to avoid mismatch.
- Route-level `head()` metadata with a unique title, description and social tags.
- No database in v1; no scoreboard, no submissions, no search, no live feeds.

## Two things I need from you

- The booking link (or how people sign up today) — I'll wire the button to it.
- Price and what's included, if it's settled. Otherwise I'll ship the marked placeholder.
