import { useCallback, useEffect, useMemo, useState } from "react";

import { allTestPeople } from "@/lib/test-guests";
import { useTestPersona } from "@/lib/test-persona";

import { slopeLevels, slopePlaces, slopeTimes } from "./slopes-content";
import type { BoardEntry, SlopePlan, SlopesState } from "./slopes-types";

// Test site only (this file does not exist on the real site's branch). About
// half of the 200 invented travellers have a made-up plan for each day, shaped
// like a real crowd: most go up at 10:00 from the Rond-Point des Pistes. The
// picked person's own plan is kept in this browser.

const KEY = "euro-ski-test-slopes";

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Weights make 10:00 and the Rond-Point the popular choices.
const timeWeights = [1, 5, 2, 1, 1];
const placeWeights = [5, 2, 2, 2, 1];
const levelWeights = [1, 2, 4, 2, 1];

function pick<T>(items: T[], weights: number[], seed: number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let n = seed % total;
  for (let i = 0; i < items.length; i++) {
    n -= weights[i] ?? 0;
    if (n < 0) return items[i]!;
  }
  return items[0]!;
}

function fakePlan(id: string, day: string): SlopePlan | null {
  const h = hash(`${id}|${day}`);
  if (h % 100 >= 55) return null;
  return {
    time: pick(slopeTimes, timeWeights, (h >>> 3) % 97),
    place: pick(slopePlaces, placeWeights, (h >>> 7) % 89),
    level: pick(
      slopeLevels.map((l) => l.id),
      levelWeights,
      (h >>> 11) % 83,
    ),
  };
}

type Mine = Record<string, SlopePlan | null>;

function readMine(): Mine {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Mine;
  } catch {
    return {};
  }
}

export function useTestSlopes(day: string): SlopesState {
  const { person } = useTestPersona();
  const email = person?.email ?? "";
  const [mine, setMine] = useState<Mine>({});
  useEffect(() => setMine(readMine()), []);

  const write = useCallback((next: Mine) => {
    setMine(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode: the plan just won't survive a reload.
    }
  }, []);

  const myKey = `${email}|${day}`;
  // Someone who has not set a plan of their own shows no plan, so the first-time form appears.
  const myPlan = mine[myKey] ?? null;

  const entries = useMemo<BoardEntry[]>(() => {
    const others: BoardEntry[] = [];
    allTestPeople().forEach((p, i) => {
      if (p.email === email || i % 17 === 0) return;
      const plan = fakePlan(p.id, day);
      if (plan) others.push({ ...plan, name: p.name, isMe: false });
    });
    return myPlan && person ? [...others, { ...myPlan, name: person.name, isMe: true }] : others;
  }, [day, email, myPlan, person]);

  const save = useCallback(
    async (plan: SlopePlan) => {
      write({ ...mine, [myKey]: plan });
      return null;
    },
    [mine, myKey, write],
  );

  const remove = useCallback(async () => {
    write({ ...mine, [myKey]: null });
    return null;
  }, [mine, myKey, write]);

  const goPick = useCallback(() => window.location.assign("/testdata"), []);
  const base = { signIn: goPick, myPlan, entries, save, remove };
  if (person === undefined) return { ...base, status: "loading" };
  if (person === null) return { ...base, status: "signed-out" };
  return { ...base, status: "signed-in" };
}
