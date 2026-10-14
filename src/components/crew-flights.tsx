import { useMemo } from "react";

import { coachFor, sameFlight, type Direction } from "@/lib/social/coach";
import type { Leg, Mate } from "@/lib/social/types";

// "Who is travelling with me": my flight, my coach, and who lands when.

function dayLabel(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

const byName = (a: Mate, b: Mate) => a.name.localeCompare(b.name);

function Names({ people, label }: { people: Mate[]; label: string }) {
  if (people.length === 0) return null;
  return (
    <details className="mt-1 text-sm">
      <summary className="cursor-pointer font-bold">
        {label} ({people.length})
      </summary>
      <ul className="mt-2 columns-2 gap-4 text-muted-foreground sm:columns-3">
        {[...people].sort(byName).map((p, i) => (
          <li key={`${p.name}-${i}`} className="break-inside-avoid">
            {p.name}
          </li>
        ))}
      </ul>
    </details>
  );
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function LegCard({ me, mates, direction }: { me: Mate; mates: Mate[]; direction: Direction }) {
  const mine = me[direction];
  const others = mates.filter((m) => !m.isMe);
  const flightMates = others.filter((m) => sameFlight(mine, m[direction]));
  const coach = coachFor(mine, direction);
  const coachMates = coach ? others.filter((m) => coachFor(m[direction], direction) === coach) : [];
  const title = direction === "arrival" ? "Arriving" : "Leaving";

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="font-display text-lg uppercase">{title}</h3>
      {mine.flight ? (
        <p className="text-sm text-muted-foreground">
          {mine.date ? `${dayLabel(mine.date)} · ` : ""}
          {mine.flight}
          {mine.time ? ` · ${direction === "arrival" ? "lands" : "takes off"} ${mine.time}` : ""}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No flight on this leg.</p>
      )}

      {mine.flight && mine.mode !== "other" && (
        <div className="mt-3">
          <p className="font-bold">
            {flightMates.length === 0
              ? "Nobody else is on your flight yet."
              : `${flightMates.length} ${plural(flightMates.length, "other", "others")} on your flight`}
          </p>
          <Names people={flightMates} label="See who" />
        </div>
      )}

      {coach ? (
        <div className="mt-3">
          <p className="font-bold">
            {coachMates.length === 0
              ? `You're the first on the ${coach} coach.`
              : `${coachMates.length} ${plural(coachMates.length, "other", "others")} on the ${coach} coach`}
          </p>
          <Names people={coachMates} label="See who" />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No airport coach for this leg, so there is nobody to list.
        </p>
      )}
    </div>
  );
}

type Row = { key: string; flight: string; airport: string; time: string; people: Mate[] };

function ArrivalsByDay({ mates }: { mates: Mate[] }) {
  const days = useMemo(() => {
    const map = new Map<string, Map<string, Row>>();
    for (const m of mates) {
      const l: Leg = m.arrival;
      if (!l.date || !l.flight || l.mode === "other") continue;
      const day = map.get(l.date) ?? new Map<string, Row>();
      const key = `${l.flight}|${l.airport ?? ""}`;
      const row = day.get(key) ?? {
        key,
        flight: l.flight,
        airport: l.airport ?? "",
        time: l.time ?? "",
        people: [],
      };
      row.people.push(m);
      day.set(key, row);
      map.set(l.date, day);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rows]) => ({
        date,
        rows: [...rows.values()].sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [mates]);

  if (days.length === 0) {
    return <p className="text-muted-foreground">Nobody has shared flights yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {days.map((d) => {
        const total = d.rows.reduce((n, r) => n + r.people.length, 0);
        return (
          <details key={d.date} className="rounded-md border border-border px-4 py-3">
            <summary className="cursor-pointer font-bold">
              {dayLabel(d.date)} · {total} {plural(total, "person", "people")}
            </summary>
            <ul className="mt-3 grid gap-3">
              {d.rows.map((r) => (
                <li key={r.key}>
                  <p className="text-sm">
                    <span className="font-bold">{r.time || "—"}</span> · {r.flight}
                    {r.airport ? ` to ${r.airport}` : ""} · {r.people.length}
                  </p>
                  <Names people={r.people} label="See who" />
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

export function CrewFlights({ mates }: { mates: Mate[] }) {
  const me = mates.find((m) => m.isMe);
  return (
    <div className="grid gap-6">
      {me ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <LegCard me={me} mates={mates} direction="arrival" />
          <LegCard me={me} mates={mates} direction="departure" />
        </div>
      ) : (
        <p className="rounded-md border border-border p-4">
          Add your own flights first, then you'll see who is on them.{" "}
          <a href="/members" className="font-bold underline">
            Go to your flights
          </a>
        </p>
      )}
      <div>
        <h3 className="mb-3 font-display text-lg uppercase">Arrivals by day</h3>
        <ArrivalsByDay mates={mates} />
      </div>
    </div>
  );
}
