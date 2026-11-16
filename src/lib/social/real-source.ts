import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/use-session";

import type { Leg, Mate, SocialState } from "./types";

// The real site: members come from Supabase through flight_mates() (migration
// 0008), which already hides anyone who turned visibility off.

type Row = Record<string, string | boolean | null>;

const hhmm = (t: unknown) => (typeof t === "string" && t ? t.slice(0, 5) : null);
const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function leg(r: Row, p: "arr" | "dep"): Leg {
  const mode = r[`${p}_mode`];
  const shuttle = r[`${p}_shuttle`];
  return {
    mode: mode === "other_flight" || mode === "other" ? mode : "geneva",
    date: text(r[`${p}_date`]),
    flight: text(r[`${p}_flight`]),
    airport: text(r[`${p}_airport`]),
    time: hhmm(r[`${p}_time`]),
    shuttle: shuttle === "yes" || shuttle === "no" || shuttle === "unsure" ? shuttle : null,
  };
}

function toMate(r: Row): Mate {
  return {
    name: text(r["name"]) ?? "Someone",
    isMe: r["is_me"] === true,
    arrival: leg(r, "arr"),
    departure: leg(r, "dep"),
  };
}

async function load(supabase: SupabaseClient): Promise<Mate[] | null> {
  const { data, error } = await supabase.rpc("flight_mates");
  if (error) return null;
  return ((data as Row[] | null) ?? []).map(toMate);
}

export function useRealSocial(): SocialState {
  const { supabase, session, signIn } = useSession("/crew");
  const [mates, setMates] = useState<Mate[]>([]);
  const [visible, setVisibleState] = useState(true);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (!supabase || !userId) return;
    let live = true;
    void Promise.all([
      load(supabase),
      supabase.from("member_profiles").select("visible").eq("user_id", userId).maybeSingle(),
    ]).then(([rows, profile]) => {
      if (!live) return;
      if (rows === null) setFailed(true);
      else setMates(rows);
      if (profile.data && typeof profile.data["visible"] === "boolean") {
        setVisibleState(profile.data["visible"]);
      }
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, [supabase, userId]);

  const setVisible = useCallback(
    async (next: boolean) => {
      if (!supabase || !session) return;
      const previous = visible;
      setVisibleState(next);
      const { error } = await supabase.from("member_profiles").upsert({
        user_id: session.user.id,
        name: session.user.user_metadata?.["full_name"] ?? null,
        visible: next,
      });
      if (error) setVisibleState(previous);
    },
    [supabase, session, visible],
  );

  if (!supabase) return { status: "unavailable", signIn: null, mates, visible, setVisible };
  if (session === undefined) return { status: "loading", signIn, mates, visible, setVisible };
  if (!session) return { status: "signed-out", signIn, mates, visible, setVisible };
  if (!loaded) return { status: "loading", signIn, mates, visible, setVisible };
  return {
    status: failed ? "unavailable" : "signed-in",
    signIn,
    mates,
    visible,
    setVisible,
  };
}
