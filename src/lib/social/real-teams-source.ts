import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/use-session";

import { shrinkImage } from "./image";
import type { Photo, PointsEntry, RosterEntry, TeamScore, TeamsState } from "./teams-types";

// The real site: teams come from Supabase through the functions in migration
// 0009. Photos live in the private "challenge-photos" bucket and are shown with
// short-lived links.

type Row = Record<string, unknown>;

type Loaded = {
  myTeam: number | null;
  roster: RosterEntry[];
  scores: TeamScore[];
  log: PointsEntry[];
  photos: Photo[];
  isAdmin: boolean;
};

const empty: Loaded = { myTeam: null, roster: [], scores: [], log: [], photos: [], isAdmin: false };

async function loadAll(supabase: SupabaseClient, userId: string): Promise<Loaded | null> {
  const [team, roster, scores, log, photoRows, admin] = await Promise.all([
    supabase.rpc("my_team"),
    supabase.rpc("team_roster"),
    supabase.rpc("team_scores"),
    supabase.rpc("team_points_log"),
    supabase
      .from("challenge_photos")
      .select("id,team,challenge,path,status,user_id")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.rpc("is_admin"),
  ]);
  if (team.error || roster.error || scores.error || log.error || photoRows.error) return null;

  const rows = (photoRows.data as Row[] | null) ?? [];
  const urls = new Map<string, string>();
  if (rows.length) {
    const signed = await supabase.storage.from("challenge-photos").createSignedUrls(
      rows.map((r) => String(r["path"])),
      3600,
    );
    for (const s of signed.data ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }

  return {
    myTeam: typeof team.data === "number" ? team.data : null,
    roster: ((roster.data as Row[] | null) ?? []).map((r) => ({
      name: String(r["name"]),
      team: Number(r["team"]),
      isMe: r["is_me"] === true,
    })),
    scores: ((scores.data as Row[] | null) ?? []).map((r) => ({
      team: Number(r["team"]),
      points: Number(r["points"]),
    })),
    log: ((log.data as Row[] | null) ?? []).map((r) => ({
      id: Number(r["id"]),
      team: Number(r["team"]),
      points: Number(r["points"]),
      reason: String(r["reason"]),
      createdAt: String(r["created_at"]),
    })),
    photos: rows.map((r) => ({
      id: String(r["id"]),
      team: Number(r["team"]),
      challenge: String(r["challenge"]),
      status: r["status"] as Photo["status"],
      url: urls.get(String(r["path"])) ?? "",
      mine: r["user_id"] === userId,
    })),
    isAdmin: admin.data === true,
  };
}

export function useRealTeams(): TeamsState {
  const { supabase, session, signIn } = useSession("/crew");
  const [data, setData] = useState<Loaded>(empty);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const userId = session?.user.id;

  const refresh = useCallback(async () => {
    if (!supabase || !userId) return;
    const next = await loadAll(supabase, userId);
    if (next) setData(next);
    else setFailed(true);
    setLoaded(true);
  }, [supabase, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitPhoto = useCallback(
    async (challenge: string, file: File) => {
      if (!supabase || !userId || data.myTeam === null) return "You are not on a team yet.";
      const blob = await shrinkImage(file);
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage
        .from("challenge-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (up.error) return "Couldn't upload the photo. Try again.";
      const ins = await supabase
        .from("challenge_photos")
        .insert({ user_id: userId, team: data.myTeam, challenge, path });
      if (ins.error) return "Couldn't save the photo. Try again.";
      await refresh();
      return null;
    },
    [supabase, userId, data.myTeam, refresh],
  );

  const reviewPhoto = useCallback(
    async (photo: Photo, points: number | null) => {
      if (!supabase) return "Not signed in.";
      const res =
        points === null
          ? await supabase
              .from("challenge_photos")
              .update({ status: "rejected" })
              .eq("id", photo.id)
          : await supabase.rpc("award_points", {
              p_team: photo.team,
              p_points: points,
              p_reason: photo.challenge,
              p_photo: photo.id,
            });
      if (res.error) return "Couldn't save that. Try again.";
      await refresh();
      return null;
    },
    [supabase, refresh],
  );

  const award = useCallback(
    async (team: number, points: number, reason: string) => {
      if (!supabase) return "Not signed in.";
      const res = await supabase.rpc("award_points", {
        p_team: team,
        p_points: points,
        p_reason: reason,
      });
      if (res.error) return "Couldn't save that. Try again.";
      await refresh();
      return null;
    },
    [supabase, refresh],
  );

  const base = { ...data, signIn, submitPhoto, reviewPhoto, award };
  if (!supabase) return { ...base, status: "unavailable" };
  if (session === undefined) return { ...base, status: "loading" };
  if (!session) return { ...base, status: "signed-out" };
  if (!loaded) return { ...base, status: "loading" };
  return { ...base, status: failed ? "unavailable" : "signed-in" };
}
