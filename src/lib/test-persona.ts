import { useCallback, useEffect, useState } from "react";

import { TEST_PERSONA_KEY, TEST_PERSONA_NAME_KEY } from "@/lib/test-persona-keys";
import { allTestPeople } from "@/lib/test-guests";
import data from "@/test-data/people.json";

// Test site only: the 200 invented travellers from scripts/gen-test-data.mjs,
// and a "which one am I" choice kept in the browser. The chatbot reads the
// chosen person from here instead of from a Google sign-in.
export type TestLeg = {
  mode: "geneva" | "other_flight" | "other";
  date: string;
  flight: string;
  airline: string;
  route: string;
  airport: string;
  time: string;
  shuttle: "yes" | "no" | "unsure";
  note?: string;
};

export type TestCoach = { slot: string | null; vehicle: string | null; why: string };

export type TestPerson = {
  id: string;
  name: string;
  email: string;
  group: string;
  arrival: TestLeg;
  departure: TestLeg;
  coach: { arrival: TestCoach; departure: TestCoach };
  room: { id: string; residence: string; room: string; type: string; roommates: string[] };
  /** Set only for someone who signed in with Google on /demo (see test-guests.ts). */
  year?: string;
  team?: number;
};

export const testPeople = data.people as unknown as TestPerson[];

const KEY = TEST_PERSONA_KEY;
const EVENT = "euro-ski-test-persona-change";

// Where the choice lives if the browser won't let us use localStorage.
let memory: string | null = null;

function read(): TestPerson | null {
  let email = memory;
  try {
    email = window.localStorage.getItem(KEY);
  } catch {
    // Fall back to the in-memory choice.
  }
  return allTestPeople().find((p) => p.email === email) ?? null;
}

/** The test person chosen on /testdata. `undefined` until the browser has been read. */
export function useTestPersona() {
  const [person, setPerson] = useState<TestPerson | null | undefined>(undefined);

  useEffect(() => {
    setPerson(read());
    const sync = () => setPerson(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const choose = useCallback((email: string | null) => {
    memory = email;
    try {
      const name = allTestPeople().find((p) => p.email === email)?.name;
      if (email) window.localStorage.setItem(KEY, email);
      else window.localStorage.removeItem(KEY);
      if (name) window.localStorage.setItem(TEST_PERSONA_NAME_KEY, name);
      else window.localStorage.removeItem(TEST_PERSONA_NAME_KEY);
    } catch {
      // Private mode: the choice just won't survive a reload.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { person, choose };
}
