# Euro Ski '27

Website and guide for a Columbia Business School Ski Club trip. Around 180 people, Val Thorens, French Alps, Saturday 9 January to Saturday 16 January 2027. Built for attendees and for members deciding whether to sign up. Most people will use it on their phone.

## Stack

- TanStack Start v1, React 19, Vite, Tailwind CSS v4, @tanstack/react-router
- Package manager: bun
- Hosting: Vercel, connected to this GitHub repo, preview deploys on every pull request
- Supabase comes in phase 2 (see roadmap). Do not add it before then.

## Structure

- Single page at `src/routes/index.tsx`, sections reached by anchor links (`#price`, `#stay`, `#week`, `#map`, `#guide`, `#contact`)
- Sticky nav pill in `src/components/site-header.tsx`
- All trip content lives in `src/lib/trip.ts`
- Fonts: Archivo Black for headings, Hind for body, set in `src/styles.css` and loaded in `src/routes/__root.tsx`
- Key components: `resort-map.tsx` (SVG schematic map), `packing-list.tsx` (tick list saved to localStorage), `status-badge.tsx` (Confirmed / Partly confirmed / Coming soon)
- `src/lib/guide.functions.ts` holds a dormant password gate. It will be replaced by Google login in phase 2. Do not extend it.

## Hard rules

These apply to every change, in every phase.

1. **Price is one number.** "From $2,344 per person", in US dollars, labelled an estimate. Never show a breakdown, a cost table, line items, or how the price is calculated. Do not add one even if it seems helpful.
2. **No personal contact details anywhere.** No phone numbers, personal emails, or links to anyone's personal WhatsApp chat. The contact line is: "Questions? Message the trip WhatsApp group." as plain text.
3. **No WhatsApp group invite link on the public page.** It goes behind login in phase 2.
4. **Games never appear on the public page.** They come back behind login in phase 2.
5. **Content lives in `src/lib/trip.ts`, not in components.** Components read from it and render whatever it holds. This will later be replaced by a Google Sheet sync, so keep the data shape clean and the read path simple.
6. **"Coming soon" is a first-class state.** Use `status-badge`. Unconfirmed items still display. No "last updated" timestamps.
7. **Current content is placeholder example data.** The committee will replace it. Do not rewrite, improve, or add new specifics (venues, times, prices, flight numbers) unless a task asks for it. Never mark anything as confirmed.
8. **Tone is committee-to-friends.** Warm, direct, a bit of dry humour. No corporate marketing language.
9. **Phone and desktop are both first-class.** Check every change at both widths, not one and then a shrug at the other. Give them different layouts where that serves the content — a wide screen is not a phone with more margin. Neither is the afterthought.

## Roadmap

Only work on the phase you are asked for. Do not scaffold later phases early.

- **Phase 1:** fix the build, content corrections, deploy to Vercel
- **Phase 2:** Supabase, Google login restricted to Columbia accounts (`columbia.edu`, `gsb.columbia.edu`) plus a committee-managed allowlist for +1s. Gated area for games and the WhatsApp link. Remove the old password gate.
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
