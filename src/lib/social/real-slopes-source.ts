import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/use-session";

import type { BoardEntry, SlopePlan, SlopesState } from "./slopes-types";

// The real site: plans come from Supabase through slope_board() (migration
// 0011), which already hides anyone who chose "hide me". The board refreshes
// by itself every 45 seconds and whenever the tab comes back into view.

type Row = Record<string, unknown>;

const REFRESH_MS = 45_000;

export function useRealSlopes(day: string): SlopesState {
  const { supabase, session, signIn } = useSession("/crew");
  const userId = session?.user.id;
  const [entries, setEntries] = useState<BoardEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase.rpc("slope_board", { p_day: day });
    if (error) {
      setFailed(true);
    } else {
      setFailed(false);
      setEntries(
        ((data as Row[] | null) ?? []).map((r) => ({
          name: String(r["name"] ?? "Someone"),
          isMe: r["is_me"] === true,
          time: String(r["plan_time"] ?? ""),
          place: String(r["place"] ?? ""),
          level: String(r["level"] ?? ""),
        })),
      );
    }
    setLoaded(true);
  }, [supabase, userId, day]);

  useEffect(() => {
    setLoaded(false);
    void refresh();
    const timer = window.setInterval(() => void refresh(), REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const save = useCallback(
    async (plan: SlopePlan) => {
      if (!supabase || !session) return "Not signed in.";
      const { error } = await supabase.from("slope_plans").upsert({
        user_id: session.user.id,
        day,
        time: plan.time,
        place: plan.place,
        level: plan.level,
        name: session.user.user_metadata?.["full_name"] ?? null,
      });
      if (error) return "Couldn't save your plan. Try again.";
      await refresh();
      return null;
    },
    [supabase, session, day, refresh],
  );

  const remove = useCallback(async () => {
    if (!supabase || !userId) return "Not signed in.";
    const { error } = await supabase
      .from("slope_plans")
      .delete()
      .eq("user_id", userId)
      .eq("day", day);
    if (error) return "Couldn't remove your plan. Try again.";
    await refresh();
    return null;
  }, [supabase, userId, day, refresh]);

  const mine = entries.find((e) => e.isMe);
  const myPlan = mine ? { time: mine.time, place: mine.place, level: mine.level } : null;
  const base = { signIn, myPlan, entries, save, remove };
  if (!supabase) return { ...base, status: "unavailable" };
  if (session === undefined) return { ...base, status: "loading" };
  if (!session) return { ...base, status: "signed-out" };
  if (!loaded) return { ...base, status: "loading" };
  return { ...base, status: failed ? "unavailable" : "signed-in" };
}
