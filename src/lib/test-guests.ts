import { allocateTeams } from "@/lib/social/allocate";
import type { TestPerson } from "@/lib/test-persona";
import data from "@/test-data/people.json";

// Test site only. Someone who signs in with Google on /demo becomes a "guest":
// a new traveller kept in this browser next to the 200 invented ones, with a
// coach, a room and a team picked for them. Nothing here touches Supabase, and
// other people's browsers never see a guest.

const KEY = "euro-ski-test-guests";

type RawPerson = { year: string; gender: string; room: { residence: string } };
const invented = data.people as unknown as Array<TestPerson & RawPerson>;

/** Teams for the 200 invented travellers, from the same balancing the real site uses. */
export const baseTeams = allocateTeams(
  invented.map((p) => ({
    key: p.email,
    year: p.year,
    gender: p.gender,
    residence: p.room.residence,
  })),
);

let memory: TestPerson[] = [];

export function readGuests(): TestPerson[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) memory = JSON.parse(raw) as TestPerson[];
  } catch {
    // Keep what we have in memory.
  }
  return memory;
}

function writeGuests(guests: TestPerson[]) {
  memory = guests;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(guests));
  } catch {
    // Private mode: the guest just won't survive a reload.
  }
}

/** The 200 invented travellers plus any guests made in this browser. */
export function allTestPeople(): TestPerson[] {
  return [...(invented as TestPerson[]), ...readGuests()];
}

/** Adds (or replaces) the guest with this email. */
export function saveGuest(guest: TestPerson) {
  writeGuests([...readGuests().filter((g) => g.email !== guest.email), guest]);
}

export function removeGuest(email: string) {
  writeGuests(readGuests().filter((g) => g.email !== email));
}

/** The team that keeps the new person's year best balanced, then the sizes level. */
export function teamForGuest(email: string, year: string): number {
  const size = [0, 0, 0, 0];
  const sameYear = [0, 0, 0, 0];
  for (const p of invented) {
    const t = (baseTeams.get(p.email) ?? 1) - 1;
    size[t]!++;
    if (p.year === year) sameYear[t]!++;
  }
  for (const g of readGuests()) {
    if (g.email === email || !g.team) continue;
    size[g.team - 1]!++;
    if (g.year === year) sameYear[g.team - 1]!++;
  }
  let best = 0;
  for (let t = 1; t < 4; t++) {
    const a = sameYear[t]! * 100 + size[t]! * 20;
    const b = sameYear[best]! * 100 + size[best]! * 20;
    if (a < b) best = t;
  }
  return best + 1;
}
