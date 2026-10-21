import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { allTestPeople } from "@/lib/test-guests";
import { testPeople, useTestPersona, type TestLeg, type TestPerson } from "@/lib/test-persona";
import { site } from "@/lib/trip";

// Test site only. Pick one of 200 invented travellers to act as them, with no
// real sign-in. Everything on this page is made up.
export const Route = createFileRoute("/testdata")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Test data · ${site.title}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TestData,
});

const groupLabel: Record<string, string> = {
  recommended: "Recommended flights",
  europe: "From Europe",
  americas: "From the Americas",
  "early-arrival": "Arrives early",
  "late-departure": "Leaves late",
  lyon: "Via Lyon",
  paris: "Via Paris",
  guest: "New member",
};

function TestData() {
  const { person, choose } = useTestPersona();

  if (person === undefined) {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  return (
    <Shell>
      {person ? (
        <Profile person={person} onSwitch={() => choose(null)} />
      ) : (
        <Picker onPick={choose} />
      )}
    </Shell>
  );
}

function Picker({ onPick }: { onPick: (email: string) => void }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTestPeople().filter(
      (p) => (!group || p.group === group) && (!q || p.name.toLowerCase().includes(q)),
    );
  }, [query, group]);

  return (
    <>
      <p>Pick who you are. This is test data: no real people, no real sign-in.</p>
      <a
        href="/demo"
        className="mt-4 block rounded-md border-2 border-dashed border-border px-4 py-3 font-bold hover:bg-secondary"
      >
        Or join as a new member with your Google account
      </a>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a name"
          aria-label="Search a name"
          className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          aria-label="Filter by how they travel"
          className="h-11 rounded-md border border-border bg-background px-3"
        >
          <option value="">Everyone ({testPeople.length})</option>
          {Object.entries(groupLabel).map(([key, label]) => (
            <option key={key} value={key}>
              {label} ({testPeople.filter((p) => p.group === key).length})
            </option>
          ))}
        </select>
      </div>
      <ul className="mt-4 grid max-h-[28rem] gap-1 overflow-y-auto">
        {shown.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onPick(p.email)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-4 py-3 text-left hover:bg-secondary"
            >
              <span className="font-bold">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {groupLabel[p.group] ?? p.group}
              </span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="text-muted-foreground">Nobody matches.</li>}
      </ul>
    </>
  );
}

function Profile({ person, onSwitch }: { person: TestPerson; onSwitch: () => void }) {
  return (
    <>
      <p className="text-sm text-muted-foreground">Acting as</p>
      <h2 className="font-display text-2xl uppercase">{person.name}</h2>
      <p className="text-sm text-muted-foreground">
        {person.email} · {groupLabel[person.group] ?? person.group}
      </p>

      <Card title="Room">
        <p className="font-bold">
          {person.room.residence}, room {person.room.room}
        </p>
        <p className="text-sm text-muted-foreground">
          {person.room.type} room, with {person.room.roommates.join(", ")}
        </p>
      </Card>

      <Card title="Getting there">
        <Leg leg={person.arrival} coach={person.coach.arrival} kind="arrival" />
      </Card>
      <Card title="Getting back">
        <Leg leg={person.departure} coach={person.coach.departure} kind="departure" />
      </Card>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button variant="outline" onClick={onSwitch}>
          Switch person
        </Button>
        <Button asChild variant="outline">
          <a href="/">Open the guide</a>
        </Button>
      </div>
    </>
  );
}

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const day = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));

function Leg({
  leg,
  coach,
  kind,
}: {
  leg: TestLeg;
  coach: { slot: string | null; vehicle: string | null; why: string };
  kind: "arrival" | "departure";
}) {
  const how =
    leg.mode === "geneva"
      ? `${leg.flight} · ${leg.route}`
      : leg.mode === "other_flight"
        ? `${leg.flight} · ${leg.route} (not Geneva)`
        : "Not flying";
  return (
    <div className="grid gap-1 text-sm">
      <p className="font-bold">
        {day(leg.date)}
        {leg.time ? `, ${kind === "arrival" ? "lands" : "leaves"} ${leg.time}` : ""}
      </p>
      <p>{how}</p>
      {leg.note && <p className="text-muted-foreground">{leg.note}</p>}
      <p>
        <span className="font-bold">Airport coach: </span>
        {coach.slot ? `Coach ${coach.vehicle} at ${coach.slot}` : coach.why || "none"}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-md border border-border p-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to {site.name}
      </a>
      <p className="mb-2 block w-fit rounded-sm bg-secondary px-2 py-1 text-xs font-bold uppercase tracking-wide">
        Test data
      </p>
      <h1 className="font-display text-3xl uppercase">Who are you?</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
