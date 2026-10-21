import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { teamById } from "@/lib/social/teams-content";
import { useSession } from "@/lib/use-session";

import { loadKnowledge } from "./knowledge";
import type { ChatProfile, KbRow, LegInfo } from "./types";

// Where the chat gets "who is asking" and "what do they see" from. The real
// site uses the Google sign-in and Supabase. The test site has a second file,
// test-environment.ts, that swaps in the picked test person; that file only
// exists on the test branch, so none of its data can reach the real site.

export type ChatIdentity = {
  status: "loading" | "signed-out" | "signed-in";
  profile: ChatProfile | null;
  /** True once we have tried to load the person's own details. */
  profileLoaded: boolean;
  signIn: (() => void) | null;
  /** The member's login token, for the server. Empty for a test person. */
  accessToken: string;
  /** Test site only: the invented person's email. Empty otherwise. */
  testEmail: string;
};

export type ChatEnvironment = {
  /** Which site this is, so logged questions can be told apart. */
  env: "live" | "test";
  /** A React hook: who is asking right now. */
  useIdentity: () => ChatIdentity;
  loadKnowledge: (identity: ChatIdentity) => Promise<KbRow[]>;
};

// ---------- the real site ---------------------------------------------------

type RoomRow = { residence: string | null; room: string | null; note: string | null };
type ShuttleRow = {
  arr_coach: string | null;
  arr_time: string | null;
  arr_pickup: string | null;
  dep_coach: string | null;
  dep_time: string | null;
  dep_pickup: string | null;
};
type FlightRow = Record<string, string | null>;

const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : null);
const clean = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

function leg(f: FlightRow | null, s: ShuttleRow | null, which: "arr" | "dep"): LegInfo | null {
  const coachName = clean(s?.[`${which}_coach`]);
  if (!f && !coachName) return null;
  const mode = (f?.[`${which}_mode`] as LegInfo["how"]) ?? null;
  const airport = f?.[`${which}_airport`] ?? null;
  const flight = clean(f?.[`${which}_flight`]);
  return {
    how: mode,
    date: f?.[`${which}_date`] ?? null,
    time: hhmm(f?.[`${which}_time`]),
    flight,
    route: airport,
    note: clean(f?.[`${which}_note`]),
    coachName,
    coachWhen: clean(s?.[`${which}_time`]),
    pickup: clean(s?.[`${which}_pickup`]),
    coachWhy: null,
    wantsCoach: (f?.[`${which}_shuttle`] as LegInfo["wantsCoach"]) ?? null,
  };
}

async function loadLiveProfile(supabase: SupabaseClient, session: Session): Promise<ChatProfile> {
  // Row level security means each of these returns only this person's own row.
  const [room, shuttle, flights, myTeam, scores] = await Promise.all([
    supabase.from("member_rooms").select("residence,room,note").maybeSingle(),
    supabase
      .from("member_shuttles")
      .select("arr_coach,arr_time,arr_pickup,dep_coach,dep_time,dep_pickup")
      .maybeSingle(),
    supabase.from("flights").select("*").maybeSingle(),
    // Teams may not be set up yet; an error just means no team to talk about.
    supabase.rpc("my_team"),
    supabase.rpc("team_scores"),
  ]);
  const r = room.data as RoomRow | null;
  const s = shuttle.data as ShuttleRow | null;
  const f = flights.data as FlightRow | null;
  const meta = session.user.user_metadata as { full_name?: string; name?: string } | undefined;
  return {
    name: clean(f?.["name"]) ?? clean(meta?.full_name) ?? clean(meta?.name),
    email: session.user.email ?? "",
    room:
      r?.residence && r.room
        ? { residence: r.residence, room: r.room, type: clean(r.note), roommates: null }
        : null,
    arrival: leg(f, s, "arr"),
    departure: leg(f, s, "dep"),
    team:
      !myTeam.error && typeof myTeam.data === "number"
        ? { name: teamById(myTeam.data).name, emoji: teamById(myTeam.data).emoji }
        : null,
    standings: scores.error
      ? null
      : ((scores.data as Array<{ team: number; points: number }> | null) ?? []).map((s) => ({
          name: teamById(s.team).name,
          points: Number(s.points),
        })),
  };
}

function useLiveIdentity(): ChatIdentity {
  const { supabase, session, signIn } = useSession();
  const [loaded, setLoaded] = useState<{ profile: ChatProfile | null; done: boolean }>({
    profile: null,
    done: false,
  });
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!supabase || !session) {
      setLoaded({ profile: null, done: false });
      return;
    }
    let cancelled = false;
    loadLiveProfile(supabase, session)
      .then((profile) => !cancelled && setLoaded({ profile, done: true }))
      .catch(() => !cancelled && setLoaded({ profile: null, done: true }));
    return () => {
      cancelled = true;
    };
    // The person, not the session object, decides when to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, userId]);

  if (session === undefined) {
    return {
      status: "loading",
      profile: null,
      profileLoaded: false,
      signIn: null,
      accessToken: "",
      testEmail: "",
    };
  }
  if (!session) {
    return {
      status: "signed-out",
      profile: null,
      profileLoaded: true,
      signIn: supabase ? signIn : null,
      accessToken: "",
      testEmail: "",
    };
  }
  return {
    status: "signed-in",
    profile: loaded.profile,
    profileLoaded: loaded.done,
    signIn: null,
    accessToken: session.access_token,
    testEmail: "",
  };
}

export const liveEnvironment: ChatEnvironment = {
  env: "live",
  useIdentity: useLiveIdentity,
  loadKnowledge: (identity) => loadKnowledge({ isMember: identity.status === "signed-in" }),
};

// ---------- picking the environment ------------------------------------------

// Exists only on the test branch. A glob, not an import, so the real site builds
// without it.
const testModules = import.meta.glob<{ testEnvironment: ChatEnvironment }>(
  "./test-environment.ts",
  {
    eager: true,
  },
);

/** Call in the browser. The test environment is used on test.* and localhost, if it exists. */
export function pickEnvironment(): ChatEnvironment {
  const test = Object.values(testModules)[0]?.testEnvironment;
  const host = window.location.hostname;
  if (test && (host.startsWith("test.") || host === "localhost")) return test;
  return liveEnvironment;
}
