# Val Thorens Planner

I'm planning a website and I want your proposals before you build anything. Do not write code yet.

Context

A university ski club trip. 179 people, Val Thorens in the French Alps, Saturday 9 January to Saturday 16 January 2027. I'm on the organising committee and I own the guide.

Useful resort facts for the pitch: highest ski resort in Europe at 2,300m, part of Les 3 Vallées with 600km of linked piste, the largest linked ski area in the world. 150km of that is in Val Thorens itself. Mostly ski-in ski-out, compact and largely pedestrian. Roughly three hours from Geneva or Lyon airports, two from Chambéry.

The site does two jobs:

Convince members to sign up. What the trip is, what's included, the price, why go. This needs to be live first.

Be the guide. Everything an attendee needs before and during the week, so seven organisers aren't answering the same question 179 times in WhatsApp.

Both halves are public for now. Later I'll put the guide behind a shared password, so the gate must be designed in from the start as a dormant switch, not retrofitted.

Content the guide must cover

This list is fixed. How it's organised is what I want you to propose.

Schedule for the week, including theme days

Map of the town and where the accommodation is

Transport: airport transfers both ways, and getting around the resort

Ski map and mountain info

FAQs: suggested flights, check-in and check-out, ski and gear rental for anyone who didn't pre-book, how to get to the mountain, how to get to après and home from the clubs

Things to do: restaurants for lunch and dinner, and activities that aren't skiing

Extra links: webcams, snow report, piste and weather bulletin

Two things to add to that list:

Non-skiers. There are daytime events for people not on the mountain, whether by choice, injury or hangover. This is a section in its own right, not a sub-bullet, and it doubles as an objection-handler for anyone deciding whether to come.

The team games. Chalet-based teams compete on a points system across the week. Rules and scoring displayed only. No scoreboard, no submissions, no input of any kind in this version.

The constraint that shapes everything

Most of this content does not exist yet. Theme days, flight guidance, transfer times, check-in, venues, non-skier activities: all still being decided. The site launches half-empty and fills in between now and January.

So "to be confirmed" is a first-class state, not an error state. It has to look deliberate. A visible last-updated date matters for the same reason: people need to know they're looking at the current version without asking.

What I want from you

Propose two or three different structures for this site. For each one, tell me:

How the two jobs relate. Same page, separate routes, something else.

How the nine content areas are grouped and navigated on a phone.

Where a half-empty section lives so it reads as forthcoming rather than broken.

What it costs to add the password gate later.

What you'd cut from v1.

Be opinionated. Tell me which one you'd pick and why, and tell me if you think any part of my content list is wrong. Then wait for me to choose.

## Development

Package manager is [bun](https://bun.com). Hosting is Vercel, which builds a
preview link for every pull request.

```sh
git clone <this-repository-url>
cd val-thorens-planner
bun install
bun run dev
```

Before pushing:

```sh
bun run typecheck   # tsc --noEmit
bun run lint        # eslint
bun run build       # production build
```
