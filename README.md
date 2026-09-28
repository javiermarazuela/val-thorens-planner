# Euro Ski ’27

Website and guide for the CBS Snow Sports trip to Val Thorens,
9–16 January 2027. It's a single page, built mostly for phones. Bookings
run through SkiSync.

Live at https://val-thorens-planner.vercel.app.

[CLAUDE.md](./CLAUDE.md) is the source of truth for the stack, structure,
content rules and roadmap. [HANDOFF.md](./HANDOFF.md) covers history,
current state and next steps.

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
