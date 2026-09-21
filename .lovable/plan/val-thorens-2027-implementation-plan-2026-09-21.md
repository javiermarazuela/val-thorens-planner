# Val Thorens 2027 — implementation plan

## Structure

Build two clearly separated public destinations sharing one identity and navigation:

1. **Trip (`/`)** — the persuasive signup page: dates, destination, price, inclusions, resort case, non-skier reassurance, and signup action.
2. **Guide (`/guide`)** — the practical attendee home, with a visible last-updated date and links to focused guide pages.

On phones, keep the header minimal and provide a persistent two-way switch between **Trip** and **Guide**. Inside the Guide, use four scannable groups rather than a nine-item global menu:

- **Plan:** schedule and theme days; transport; FAQs
- **Mountain:** town and accommodation map; ski map and mountain information
- **Off-slope:** things to do; non-skiers
- **Club:** team games; live conditions

Each of the nine areas gets its own shareable page so attendees can link directly to an answer in group chats.

## Trip page

- Lead with Val Thorens, 9–16 January 2027, and the signup proposition.
- Present the confirmed resort facts: 2,300m, 600km across Les 3 Vallées, 150km locally, ski-in/ski-out character, and airport journey context.
- Give price and inclusions high visual priority, using clearly marked forthcoming placeholders until supplied.
- Give Non-skiers a substantial section on this page as an objection-handler, linking to the full guide area.
- Preview the Guide to show that attendees will have one maintained source of truth.

## Guide pages

- Guide home: last-updated date, quick links, the four groups, and a clear completeness status for every area.
- Schedule: week view with theme-day slots.
- Town and accommodation: accommodation locations and official/external map access in v1.
- Transport: suggested flights, both airport transfers, and resort travel.
- Mountain: piste map, mountain facts, rental fallback, and how to reach the slopes.
- FAQs: only residual cross-cutting questions; move topic-specific answers into their relevant pages.
- Things to do: lunch, dinner, après, clubs, and non-ski activities that are not part of the organised non-skier programme.
- Non-skiers: a first-class daytime programme for choice, injury, rest, or hangover days.
- Team games: rules and points values only; no scoreboard, submission, or input controls.
- Live conditions: webcams, snow report, piste bulletin, and weather links.
- Add a compact urgent-help and organiser-contact area to the Guide before launch.

## Forthcoming content

Treat missing information as planned publication, not empty UI:

- Every unfinished section remains in its final location.
- Use three explicit states: **Confirmed**, **Partly confirmed**, and **Coming soon**.
- A forthcoming block says what is known, what is still being decided, and—when available—when the update is expected.
- Show a site-wide Guide update date prominently and a smaller update date on each guide page.
- Never invent prices, venues, transfer times, flights, activities, or inclusions.

## Password-ready design

Prepare the Guide as an isolated route group with all protected copy supplied through a server boundary from the start. Keep the Trip page outside that boundary.

The password switch remains off in v1. Enabling it later will require adding the shared password and encrypted session secrets, an unlock page, and turning on the existing Guide guard—not reorganising pages or moving content. The password will never be shipped to the browser.

## v1 scope

Include:
- Responsive Trip and Guide experiences
- All nine guide areas and deliberate forthcoming states
- Direct links to official maps and live information
- Last-updated indicators
- Accessible navigation and readable phone layouts
- Route-specific page titles and sharing descriptions

Defer:
- Interactive town or piste maps
- Automated webcam, snow, piste, or weather feeds
- Search
- Organiser editing tools or a database
- Accounts or an active password gate
- Team scoreboard, submissions, and attendee input
- Automatic date-based site modes

## Content correction

Rename **Extra links** to **Live conditions**. Distribute flight, rental, mountain-access, après, and late-night travel answers into their subject pages; keep **FAQs** as a short catch-all rather than a duplicate information store.

## Technical notes

- Use separate public routes for the Trip, Guide home, and each guide area.
- Keep trip content in one structured source so confirmed/forthcoming status and update dates are consistent.
- Use the project’s existing React/TanStack structure and semantic design tokens.
- Do not add a database in v1; the committee-owned guide can begin as maintained site content.
- Verify desktop and phone layouts, navigation, metadata, and every forthcoming state before completion.
