# Prompt for Claude Design — Euro Ski '27 guide redesign

Paste everything below the line.

---

## What I need

Design the front end for **Euro Ski '27**, the trip guide for a Columbia Business School Ski Club week in **Val Thorens, French Alps, Saturday 9 – Saturday 16 January 2027**. About 170 people, all already booked (the trip is sold out). The site used to sell the trip. It is now purely a **guide people use during the trip**, mostly on their phones, often standing in the cold with one glove off.

**Design, colour and feel matter most here.** Give me **three clearly different visual directions** first (a single scrolling mock of each is enough), and I'll pick one. Then build the chosen one into a **reusable backbone** I can keep developing: the scroll and navigation system, the section shell, and one worked example of each section type, with placeholder content.

## The core idea

One long page you **scroll down through, section by section**, and it should feel like skiing a run: a continuous flow, not a stack of unrelated blocks.

- **A "you are here" visualization on the left** (desktop). Think of a vertical trail map or piste line with a numbered stop for every section. The marker moves as you scroll, finished sections fill in, and clicking a stop jumps there. It is the main navigation and also what makes the site feel cool. Piste-grade colours (green, blue, red, black) are welcome, but every stop also carries a number or icon so colour is never the only signal.
- **A slim top bar as well**, with the site name and a compact version of the same progress, so the menu exists on every width.
- **On phones**, the left rail can't exist. Propose the best equivalent (a thin progress line plus a section chip bar, a bottom sheet, a floating mini-map… your call) and show it. Phone is the primary layout, desktop is not an afterthought. Design both properly, with different layouts where the content benefits.
- **Sections must be clearly separated** from each other. Try lines, background shading, colour shifts, or a mix, and show me which works. Each section has its own identity (number, name, accent) while the whole still feels like one site. Smooth, tasteful scroll motion is welcome. It must stay fast on a phone and respect `prefers-reduced-motion`.

## Page structure, in order

**0. Welcome + "Today" card** (top of the page). Site name, dates, a short welcome. Beneath it, a **"Today" card** that is the first thing people look at once they're in resort. It shows, for the current day: the day's theme, today's events, the next bus, the weather and snow, and a place for a game or challenge of the day. **Design only the version that is the same for everyone and needs no login.** Treat it as a compact dashboard of 4–6 small tiles with a day selector (so before the trip it can show "Day 1 – Saturday" or a countdown). Leave tasteful room for a "your own details" tile, but don't design the signed-in version now. I'll ask for that separately.

**1. Schedule.** The week as a calendar, redesigned to look great. Each day has a theme (theme days, details to be announced), plus Saturday arrival and Saturday departure. Placeholder content is fine.

**2. Maps** (town map and ski map in one section, each with a small title on top).
   - Desktop: **side by side**. Phone: **one on top of the other**.
   - *Town map:* interactive map of Val Thorens showing our condos (Résidence Village Montana), lifts, restaurants, bars, après and clubs, filterable by category. Currently MapLibre; tapping a pin opens a card with an "Open in Google Maps" link.
   - *Ski maps:* the piste map as an image that is zoomable on a phone. Tapping it opens the official resort map on valthorens.com. **Show only the Val Thorens + Orelle map** in the page. Underneath it, two download links as plain text links: **"Download Val Thorens map"** and **"Download Les 3 Vallées full map"**. Each downloads a PDF. The PDFs are official 2025–26 maps hosted on our own site, so they work offline. Add a small note saying so. Use a placeholder image for the map preview.

**3. Getting around.** Bus schedules within the resort, how to get to the mountain, and how to get to après and home from the clubs. Readable at a glance: next departures, direction toggle.

**4. Getting here & away.** Flights, airport buses, check-in and check-out. Suggested flights, airport bus to/from Val Thorens, check-in and check-out instructions. Think of it as the section you read before the trip and on the last day.

**5. Things to do.** Restaurants for lunch and dinner, and non-ski activities. Cards with a category filter.

**6. FAQs.** Expandable answers for what's left: recommended ski gear rental places (for people who didn't pre-book), and any other common questions.

**7. In case of trouble.** Emergency number 112, the resort doctor and pharmacy, and the plain-text line "Questions? Message the trip WhatsApp group." No personal phone numbers.

**8. Extra links & packing list.** Webcams and snow report, other useful links, and a packing checklist where ticks are saved on the phone.

## Constraints

- **Stack to hand over to:** React 19, TanStack Start/Router, Tailwind CSS v4, MapLibre, deployed on Vercel. Output components that drop into that (TSX + Tailwind), no heavy new dependencies. Say which ones you used if any.
- **Content is data, not hard-coded.** Every section reads from plain typed objects (one data file), so I can swap the content in later and eventually sync it from a Google Sheet.
- **No prices, no sales copy, no sign-up buttons.** Nobody is being persuaded any more.
- **No personal contact details** (no phone numbers, personal emails).
- **Accessibility:** colour is never the only signal, text contrast passes AA, tap targets are at least 44px.
- **Offline-minded:** a PWA is planned, so avoid anything that needs a network to render the basic layout.
- **Tone:** committee-to-friends. Warm, direct, a bit of dry humour. No corporate marketing language.

## Mood

Alpine, winter, social. I want it to feel like a well-designed ski resort or a nice trail map, not a SaaS landing page. Show me one direction that is bright and crisp (snow, sky, bold colour), one that is more editorial/poster-like, and one that is bolder or more playful. Fonts currently used: Archivo Black for headings, Hind for body. You may keep or replace them.

## What to hand back

1. The three directions.
2. After I choose: the backbone: layout shell, left rail and mobile navigation, scroll-spy logic, section wrapper component, the Today card, and one example of each section type, wired to a sample data file.
3. A short note on how it's structured and how to add a new section.
