import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  defaultSlopeLevel,
  defaultSlopePlace,
  defaultSlopeTime,
  franceMinutes,
  franceToday,
  levelLabel,
  slopeDays,
  slopeLevels,
  slopePlaces,
  slopesNow,
  slopesStatus,
  slopeTimes,
} from "@/lib/social/slopes-content";
import type { BoardEntry, SlopePlan, SlopesState } from "@/lib/social/slopes-types";

import { StatusBadge } from "./status-badge";

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

function PlanForm({ state }: { state: SlopesState }) {
  const [plan, setPlan] = useState<SlopePlan>(
    state.myPlan ?? { time: defaultSlopeTime, place: defaultSlopePlace, level: defaultSlopeLevel },
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function run(job: () => Promise<string | null>, done: string) {
    setBusy(true);
    setMessage(null);
    const err = await job();
    setBusy(false);
    setMessage(err ? { text: err, ok: false } : { text: done, ok: true });
  }

  const set = (patch: Partial<SlopePlan>) => setPlan((p) => ({ ...p, ...patch }));
  const same = state.entries.filter(
    (e) =>
      !e.isMe && state.myPlan && e.time === state.myPlan.time && e.place === state.myPlan.place,
  ).length;

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="font-display text-lg uppercase">
        {state.myPlan ? "Your plan" : "I'm going up"}
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold">
          Time
          <select
            className={field}
            value={plan.time}
            onChange={(e) => set({ time: e.target.value })}
          >
            {slopeTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Where
          <select
            className={field}
            value={plan.place}
            onChange={(e) => set({ place: e.target.value })}
          >
            {slopePlaces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Level
          <select
            className={field}
            value={plan.level}
            onChange={(e) => set({ level: e.target.value })}
          >
            {slopeLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={busy} onClick={() => void run(() => state.save(plan), "Saved.")}>
          {state.myPlan ? "Update my plan" : "I'm going"}
        </Button>
        {state.myPlan && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run(state.remove, "Plan removed.")}
            className="text-sm font-bold text-muted-foreground underline hover:text-foreground"
          >
            Cancel my plan
          </button>
        )}
        {message && (
          <span
            role={message.ok ? "status" : "alert"}
            className={`text-sm font-semibold ${message.ok ? "" : "text-destructive"}`}
          >
            {message.text}
          </span>
        )}
      </div>
      {state.myPlan && (
        <p className="mt-3 text-sm text-muted-foreground">
          {same === 0
            ? "Nobody else has picked your time and place yet."
            : `${same} ${same === 1 ? "other" : "others"} at ${state.myPlan.place} at ${state.myPlan.time}.`}
        </p>
      )}
    </div>
  );
}

type Slot = { time: string; total: number; places: Array<{ place: string; list: BoardEntry[] }> };

function slots(entries: BoardEntry[]): Slot[] {
  const byTime = new Map<string, Map<string, BoardEntry[]>>();
  for (const e of entries) {
    const places = byTime.get(e.time) ?? new Map<string, BoardEntry[]>();
    places.set(e.place, [...(places.get(e.place) ?? []), e]);
    byTime.set(e.time, places);
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, places]) => ({
      time,
      total: [...places.values()].reduce((n, l) => n + l.length, 0),
      places: [...places.entries()]
        .sort(([, a], [, b]) => b.length - a.length)
        .map(([place, list]) => ({
          place,
          list: [...list].sort((a, b) => a.name.localeCompare(b.name)),
        })),
    }));
}

function SlotCard({ slot }: { slot: Slot }) {
  return (
    <li className="rounded-md border border-border p-4">
      <p className="flex items-baseline justify-between gap-3">
        <span className="font-display text-xl">{slot.time}</span>
        <span className="text-sm font-bold text-muted-foreground">{people(slot.total)}</span>
      </p>
      <ul className="mt-2 grid gap-3">
        {slot.places.map((p) => (
          <li key={p.place}>
            <p className="text-sm font-bold">
              {p.place} <span className="text-muted-foreground">· {p.list.length}</span>
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">See who</summary>
              <ul className="mt-1 columns-2 gap-4 sm:columns-3">
                {p.list.map((e, i) => (
                  <li key={`${e.name}-${i}`} className="break-inside-avoid">
                    <span className={e.isMe ? "font-bold" : ""}>{e.name}</span>{" "}
                    <span className="text-xs text-muted-foreground">{levelLabel(e.level)}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function CrewSlopes({
  state,
  day,
  onDay,
}: {
  state: SlopesState;
  day: string;
  onDay: (iso: string) => void;
}) {
  const now = slopesNow();
  const isToday = franceToday(now) === day;
  const nowMinutes = franceMinutes(now);

  const { upcoming, earlier } = useMemo(() => {
    const all = slots(state.entries);
    if (!isToday) return { upcoming: all, earlier: [] as Slot[] };
    const cutoff = nowMinutes - 90; // a plan counts as over 90 minutes after it starts
    const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
    return {
      upcoming: all.filter((s) => mins(s.time) >= cutoff),
      earlier: all.filter((s) => mins(s.time) < cutoff),
    };
  }, [state.entries, isToday, nowMinutes]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Pick a day" className="flex flex-wrap gap-2">
          {slopeDays.map((d) => (
            <button
              key={d.iso}
              role="tab"
              aria-selected={d.iso === day}
              onClick={() => onDay(d.iso)}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
                d.iso === day ? "border-ink bg-ink text-paper" : "border-border hover:bg-secondary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <StatusBadge status={slopesStatus} />
      </div>

      <PlanForm key={`${day}-${state.myPlan ? "set" : "new"}`} state={state} />

      <div>
        <h3 className="mb-3 font-display text-lg uppercase">
          {isToday ? "Who's skiing today" : "Who's skiing"}
        </h3>
        {upcoming.length === 0 && earlier.length === 0 && (
          <p className="text-muted-foreground">Nobody has posted a plan yet. Be the first.</p>
        )}
        <ul className="grid gap-3">
          {upcoming.map((s) => (
            <SlotCard key={s.time} slot={s} />
          ))}
        </ul>
        {earlier.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-bold text-muted-foreground">
              Earlier today ({earlier.reduce((n, s) => n + s.total, 0)})
            </summary>
            <ul className="mt-3 grid gap-3">
              {earlier.map((s) => (
                <SlotCard key={s.time} slot={s} />
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
