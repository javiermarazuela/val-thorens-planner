// Splits everyone into teams, balanced on year, gender and residence. Pure and
// seeded, so the same list always gives the same teams. Used by the committee's
// allocation script (scripts/allocate-teams.ts) and by the test site.

export type TeamCandidate = {
  /** Anything unique: an email, or a test id. */
  key: string;
  year: string;
  gender: string;
  residence: string;
};

// What matters most first: each year-and-gender group is dealt evenly, then
// team sizes stay level, then residences are spread.
const WEIGHT = { group: 100, size: 20, residence: 3 };

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Team number (1 to `teams`) for every key. */
export function allocateTeams(
  people: TeamCandidate[],
  teams = 4,
  seed = 2027,
): Map<string, number> {
  const rand = seededRandom(seed);
  const order = [...people];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }

  const size = Array<number>(teams).fill(0);
  const group = Array.from({ length: teams }, () => new Map<string, number>());
  const residence = Array.from({ length: teams }, () => new Map<string, number>());
  const result = new Map<string, number>();

  for (const p of order) {
    const g = `${p.year}|${p.gender}`;
    let best = 0;
    let bestCost = Infinity;
    for (let t = 0; t < teams; t++) {
      const cost =
        WEIGHT.group * (group[t]!.get(g) ?? 0) +
        WEIGHT.size * size[t]! +
        WEIGHT.residence * (residence[t]!.get(p.residence) ?? 0) +
        rand();
      if (cost < bestCost) {
        bestCost = cost;
        best = t;
      }
    }
    size[best]!++;
    group[best]!.set(g, (group[best]!.get(g) ?? 0) + 1);
    residence[best]!.set(p.residence, (residence[best]!.get(p.residence) ?? 0) + 1);
    result.set(p.key, best + 1);
  }
  return result;
}
