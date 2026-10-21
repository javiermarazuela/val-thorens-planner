import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  challengeById,
  challenges,
  challengesStatus,
  teamById,
  teams,
  type TeamInfo,
} from "@/lib/social/teams-content";
import type { Photo, TeamsState } from "@/lib/social/teams-types";

import { StatusBadge } from "./status-badge";

function Shape({ team, size = 16 }: { team: TeamInfo; size?: number }) {
  const common = { fill: team.color };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      {team.shape === "circle" && <circle cx="8" cy="8" r="7" {...common} />}
      {team.shape === "square" && (
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" {...common} />
      )}
      {team.shape === "diamond" && <path d="M8 .5 15.5 8 8 15.5.5 8z" {...common} />}
      {team.shape === "triangle" && <path d="M8 1 15 14.5H1z" {...common} />}
    </svg>
  );
}

function MyTeam({ state }: { state: TeamsState }) {
  if (state.myTeam === null) {
    return (
      <p className="rounded-md border border-border p-4">
        Teams haven't been announced yet. You'll see yours here as soon as they are.
      </p>
    );
  }
  const team = teamById(state.myTeam);
  const mates = state.roster.filter((r) => r.team === team.id);
  return (
    <div className="rounded-md p-5 text-white" style={{ backgroundColor: team.color }}>
      <p className="text-sm font-bold uppercase tracking-wide opacity-90">Your team</p>
      <p className="mt-1 flex items-center gap-2 font-display text-3xl uppercase">
        <span aria-hidden="true">{team.emoji}</span> {team.name}
      </p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-bold">Your teammates ({mates.length})</summary>
        <ul className="mt-2 columns-2 gap-4 sm:columns-3">
          {mates.map((m, i) => (
            <li key={`${m.name}-${i}`} className="break-inside-avoid">
              {m.name}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function Leaderboard({ state }: { state: TeamsState }) {
  const max = Math.max(1, ...state.scores.map((s) => s.points));
  const rows = teams
    .map((t) => ({ team: t, points: state.scores.find((s) => s.team === t.id)?.points ?? 0 }))
    .sort((a, b) => b.points - a.points);
  return (
    <ol className="grid gap-2">
      {rows.map((r, i) => (
        <li key={r.team.id} className="rounded-md border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-bold">
              <span className="w-4 text-muted-foreground">{i + 1}</span>
              <Shape team={r.team} />
              {r.team.name}
              {r.team.id === state.myTeam && (
                <span className="text-xs font-bold text-muted-foreground">(you)</span>
              )}
            </span>
            <span className="font-display text-lg">{r.points}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(r.points / max) * 100}%`, backgroundColor: r.team.color }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

function Challenges({ state }: { state: TeamsState }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function pick(id: string, file: File | undefined) {
    if (!file) return;
    setBusy(id);
    setMessage(null);
    const err = await state.submitPhoto(id, file);
    setBusy(null);
    setMessage(
      err
        ? { id, text: err, ok: false }
        : { id, text: "Sent. The committee will review it.", ok: true },
    );
  }

  return (
    <div className="grid gap-3">
      {challenges.map((c) => {
        const mine = state.photos.filter((p) => p.challenge === c.id && p.mine);
        return (
          <div key={c.id} className="rounded-md border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold">{c.title}</h4>
              <span className="shrink-0 text-sm font-bold text-muted-foreground">
                {c.points} pts
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            {state.myTeam !== null && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={(el) => {
                    inputs.current[c.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void pick(c.id, e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === c.id}
                  onClick={() => inputs.current[c.id]?.click()}
                >
                  {busy === c.id ? "Uploading…" : "Add a photo"}
                </Button>
                {mine.map((p) => (
                  <span key={p.id} className="text-xs font-bold text-muted-foreground">
                    {p.status === "approved"
                      ? "Approved"
                      : p.status === "rejected"
                        ? "Not accepted"
                        : "Waiting for review"}
                  </span>
                ))}
              </div>
            )}
            {message?.id === c.id && (
              <p
                role={message.ok ? "status" : "alert"}
                className={`mt-2 text-sm font-semibold ${message.ok ? "" : "text-destructive"}`}
              >
                {message.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Gallery({ photos }: { photos: Photo[] }) {
  const approved = photos.filter((p) => p.status === "approved" && p.url);
  if (approved.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-lg uppercase">Photo wall</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {approved.map((p) => {
          const team = teamById(p.team);
          return (
            <li key={p.id} className="overflow-hidden rounded-md border border-border">
              <img
                src={p.url}
                alt={challengeById(p.challenge)?.title ?? "Challenge photo"}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold">
                <Shape team={team} size={10} />
                {team.name} · {challengeById(p.challenge)?.title}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Admin({ state }: { state: TeamsState }) {
  const [team, setTeam] = useState(1);
  const [points, setPoints] = useState("10");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const pending = state.photos.filter((p) => p.status === "pending");

  async function give() {
    const n = Number(points);
    if (!Number.isFinite(n) || n === 0 || !reason.trim()) {
      setMsg("Add points and a reason.");
      return;
    }
    const err = await state.award(team, n, reason.trim());
    setMsg(err ?? "Added.");
    if (!err) setReason("");
  }

  return (
    <div className="rounded-md border-2 border-dashed border-border p-4">
      <h3 className="font-display text-lg uppercase">Committee</h3>

      <h4 className="mt-3 font-bold">Photos to review ({pending.length})</h4>
      {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing waiting.</p>}
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {pending.map((p) => {
          const c = challengeById(p.challenge);
          const t = teamById(p.team);
          return (
            <li key={p.id} className="overflow-hidden rounded-md border border-border">
              {p.url ? (
                <img
                  src={p.url}
                  alt={c?.title ?? "Photo"}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="aspect-video bg-secondary" />
              )}
              <div className="p-3">
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <Shape team={t} size={12} /> {t.name} · {c?.title ?? p.challenge}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => void state.reviewPhoto(p, c?.points ?? 10)}>
                    Approve +{c?.points ?? 10}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void state.reviewPhoto(p, null)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <h4 className="mt-5 font-bold">Give points</h4>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={team}
          onChange={(e) => setTeam(Number(e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          aria-label="Team"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          inputMode="numeric"
          aria-label="Points"
          className="w-16 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason, e.g. Bar crawl winner"
          aria-label="Reason"
          className="min-w-40 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
        <Button size="sm" onClick={() => void give()}>
          Add
        </Button>
      </div>
      {msg && (
        <p role="status" className="mt-2 text-sm font-semibold">
          {msg}
        </p>
      )}

      {state.log.length > 0 && (
        <>
          <h4 className="mt-5 font-bold">Recent points</h4>
          <ul className="mt-2 grid gap-1 text-sm">
            {state.log.slice(0, 10).map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span>
                  {teamById(l.team).name} · {l.reason}
                </span>
                <span className="font-bold">{l.points > 0 ? `+${l.points}` : l.points}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function CrewTeams({ state }: { state: TeamsState }) {
  return (
    <div className="grid gap-6">
      <MyTeam state={state} />
      <div>
        <h3 className="mb-3 font-display text-lg uppercase">Leaderboard</h3>
        <Leaderboard state={state} />
      </div>
      <div>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="font-display text-lg uppercase">Challenges</h3>
          <StatusBadge status={challengesStatus} />
        </div>
        <Challenges state={state} />
      </div>
      <Gallery photos={state.photos} />
      {state.isAdmin && <Admin state={state} />}
    </div>
  );
}
