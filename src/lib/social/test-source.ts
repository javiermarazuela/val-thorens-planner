import { useCallback, useMemo, useState } from "react";

import { allTestPeople } from "@/lib/test-guests";
import { useTestPersona, type TestLeg } from "@/lib/test-persona";

import type { Leg, Mate, SocialState } from "./types";

// Test site only (this file does not exist on the real site's branch). The
// crowd is the 200 invented travellers; "me" is whoever was picked on
// /testdata. Every 17th person has switched visibility off, so the hidden case
// is exercised too.

const HIDE_KEY = "euro-ski-test-hide-me";

const toLeg = (l: TestLeg): Leg => ({
  mode: l.mode,
  date: l.date || null,
  flight: l.flight || null,
  airport: l.airport || null,
  time: l.time || null,
  shuttle: l.shuttle,
});

function readHidden(): boolean {
  try {
    return window.localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useTestSocial(): SocialState {
  const { person } = useTestPersona();
  const [hidden, setHidden] = useState(readHidden);

  const mates = useMemo<Mate[]>(() => {
    if (!person) return [];
    return allTestPeople()
      .filter((p, i) => p.email === person.email || i % 17 !== 0)
      .map((p) => ({
        name: p.name,
        isMe: p.email === person.email,
        arrival: toLeg(p.arrival),
        departure: toLeg(p.departure),
      }));
  }, [person]);

  const setVisible = useCallback(async (next: boolean) => {
    setHidden(!next);
    try {
      if (next) window.localStorage.removeItem(HIDE_KEY);
      else window.localStorage.setItem(HIDE_KEY, "1");
    } catch {
      // Private mode: the choice just won't survive a reload.
    }
  }, []);

  const goPick = useCallback(() => {
    window.location.assign("/testdata");
  }, []);

  if (person === undefined) {
    return { status: "loading", signIn: null, mates, visible: !hidden, setVisible };
  }
  if (person === null) {
    return { status: "signed-out", signIn: goPick, mates, visible: !hidden, setVisible };
  }
  return { status: "signed-in", signIn: goPick, mates, visible: !hidden, setVisible };
}
