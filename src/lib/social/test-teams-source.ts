import { useCallback, useMemo, useState } from "react";

import { allTestPeople, baseTeams } from "@/lib/test-guests";
import { useTestPersona } from "@/lib/test-persona";

import { shrinkImage } from "./image";
import type { CrewAccess, Photo, PointsEntry, TeamsState } from "./teams-types";

// Test site only (this file does not exist on the real site's branch). Teams
// come from running the real allocation over the 200 invented travellers.
// Points and photos are kept in this browser only, and whoever you pick can act
// as a committee admin, so the review screen can be tried.

const STORE_KEY = "euro-ski-test-teams";

type Stored = { log: PointsEntry[]; photos: (Photo & { mineBy: string })[] };

const seed: Stored = {
  log: [
    { id: 1, team: 2, points: 20, reason: "Welcome Drinks quiz", createdAt: "2027-01-09T20:00" },
    { id: 2, team: 4, points: 30, reason: "Summit selfie", createdAt: "2027-01-10T15:00" },
    { id: 3, team: 1, points: 10, reason: "Learn five names", createdAt: "2027-01-10T19:00" },
  ],
  photos: [],
};

function read(): Stored {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as Stored;
  } catch {
    // Fall through to the seed.
  }
  return seed;
}

function write(next: Stored) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or full storage: the change just won't survive a reload.
  }
}

// A guest (someone who signed in on /demo) carries their own team; the invented 200 come
// from the shared allocation.
const teamOf = (p: { email: string; team?: number }): number | null =>
  p.team ?? baseTeams.get(p.email) ?? null;

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function useTestTeams(): TeamsState {
  const { person } = useTestPersona();
  const [store, setStore] = useState<Stored>(read);
  const email = person?.email ?? "";

  const update = useCallback((next: Stored) => {
    write(next);
    setStore(next);
  }, []);

  const myTeam = person ? teamOf(person) : null;

  const roster = useMemo(
    () =>
      allTestPeople()
        .filter((p, i) => i % 17 !== 0 || p.email === email)
        .map((p) => ({
          name: p.name,
          team: teamOf(p) ?? 1,
          isMe: p.email === email,
        })),
    [email],
  );

  const scores = useMemo(
    () =>
      [1, 2, 3, 4].map((team) => ({
        team,
        points: store.log.filter((l) => l.team === team).reduce((n, l) => n + l.points, 0),
      })),
    [store.log],
  );

  const photos: Photo[] = store.photos.map((p) => ({ ...p, mine: p.mineBy === email }));

  const submitPhoto = useCallback(
    async (challenge: string, file: File) => {
      if (myTeam === null) return "You are not on a team yet.";
      const url = await toDataUrl(await shrinkImage(file, 600, 0.7));
      const next: Stored = {
        ...store,
        photos: [
          {
            id: crypto.randomUUID(),
            team: myTeam,
            challenge,
            status: "pending",
            url,
            mine: true,
            mineBy: email,
          },
          ...store.photos,
        ],
      };
      update(next);
      return null;
    },
    [store, myTeam, email, update],
  );

  const reviewPhoto = useCallback(
    async (photo: Photo, points: number | null) => {
      const photos = store.photos.map((p) =>
        p.id === photo.id
          ? { ...p, status: points === null ? ("rejected" as const) : ("approved" as const) }
          : p,
      );
      const log =
        points === null
          ? store.log
          : [
              {
                id: Date.now(),
                team: photo.team,
                points,
                reason: photo.challenge,
                createdAt: new Date().toISOString(),
              },
              ...store.log,
            ];
      update({ photos, log });
      return null;
    },
    [store, update],
  );

  const award = useCallback(
    async (team: number, points: number, reason: string) => {
      update({
        ...store,
        log: [
          { id: Date.now(), team, points, reason, createdAt: new Date().toISOString() },
          ...store.log,
        ],
      });
      return null;
    },
    [store, update],
  );

  const goPick = useCallback(() => window.location.assign("/testdata"), []);
  const base = {
    signIn: goPick,
    myTeam,
    roster,
    scores,
    log: store.log,
    photos,
    isAdmin: true,
    submitPhoto,
    reviewPhoto,
    award,
  };
  if (person === undefined) return { ...base, status: "loading" };
  if (person === null) return { ...base, status: "signed-out" };
  return { ...base, status: "signed-in" };
}

/** The light version for the guide: signed in (a person was picked) and their team. */
export function useTestCrewAccess(): CrewAccess {
  const { person } = useTestPersona();
  if (!person) return { signedIn: false, team: null, teamKnown: person !== undefined };
  return { signedIn: true, team: teamOf(person), teamKnown: true };
}

/** The invented person's team, for Julian. */
export function testTeamFor(email: string): number | null {
  return teamOf(allTestPeople().find((p) => p.email === email) ?? { email });
}

/** Every team with its points, best first, from what has been awarded in this browser. */
export function testStandings(): Array<{ team: number; points: number }> {
  const { log } = read();
  return [1, 2, 3, 4]
    .map((team) => ({
      team,
      points: log.filter((l) => l.team === team).reduce((n, l) => n + l.points, 0),
    }))
    .sort((a, b) => b.points - a.points || a.team - b.team);
}
