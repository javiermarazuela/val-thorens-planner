import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, BedDouble, Bus, Check, Loader2, Plane, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  allocate,
  SEATS,
  toGuest,
  type DemoAllocation,
  type DemoCoach,
  type DemoFlights,
  type DemoLeg,
} from "@/lib/demo-allocate";
import { removeGuest, saveGuest, teamForGuest } from "@/lib/test-guests";
import { useTestPersona } from "@/lib/test-persona";
import { teamById } from "@/lib/social/teams-content";
import { suggestionsFor, tripDates, type FlightSuggestion } from "@/lib/flight-suggestions";
import { site } from "@/lib/trip";
import { useSession } from "@/lib/use-session";

// Test site only. Sign in with Google, log your flights, and watch a coach
// and a room get picked for you. The allocation is a demo that runs in the
// browser and is saved there; nothing is written to the real flights table.
export const Route = createFileRoute("/demo")({
  ssr: false,
  head: () => ({
    meta: [{ title: `Try it · ${site.title}` }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Demo,
});

type Saved = { flights: DemoFlights; result: DemoAllocation; year: string; team: number };

const storeKey = (userId: string) => `euro-ski-demo:${userId}`;

function readSaved(userId: string): Saved | null {
  try {
    const raw = window.localStorage.getItem(storeKey(userId));
    const saved = raw ? (JSON.parse(raw) as Partial<Saved>) : null;
    // An older save without a team means starting again.
    return saved?.team ? (saved as Saved) : null;
  } catch {
    return null;
  }
}

function Demo() {
  const { supabase, session, authError, signIn } = useSession("/demo");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [working, setWorking] = useState<number | null>(null);
  const { choose } = useTestPersona();
  const userId = session?.user.id;
  const email = session?.user.email ?? "";

  useEffect(() => {
    if (userId) setSaved(readSaved(userId));
  }, [userId]);

  function submit(flights: DemoFlights, year: string) {
    if (!userId) return;
    const result = allocate(email, flights);
    const team = teamForGuest(email, year);
    const meta = session?.user.user_metadata as { full_name?: string } | undefined;
    const name = meta?.full_name ?? email.split("@")[0] ?? "New member";
    // Three short steps so the matching is visible, then the answer.
    setWorking(0);
    setSaved(null);
    [1, 2, 3, 4].forEach((step, i) =>
      window.setTimeout(
        () => {
          if (step < 4) {
            setWorking(step);
            return;
          }
          setWorking(null);
          const next = { flights, result, year, team };
          setSaved(next);
          // From here on the whole test site treats this person as a traveller.
          saveGuest(toGuest(name, email, year, team, flights, result));
          choose(email);
          try {
            window.localStorage.setItem(storeKey(userId), JSON.stringify(next));
          } catch {
            // The result still shows; it just won't survive a reload.
          }
        },
        (i + 1) * 900,
      ),
    );
  }

  function reset() {
    removeGuest(email);
    if (userId) {
      try {
        window.localStorage.removeItem(storeKey(userId));
      } catch {
        // Nothing to clear.
      }
    }
    setSaved(null);
  }

  if (!supabase) {
    return (
      <Shell>
        <p>Login isn't switched on for this deploy yet.</p>
      </Shell>
    );
  }
  if (session === undefined) {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  if (!session) {
    return (
      <Shell>
        <ol className="grid gap-2 text-sm">
          <li>1. Sign in with Google</li>
          <li>2. Log your flights and say which year you are in</li>
          <li>3. Get your coach, room and team, automatically</li>
        </ol>
        {authError && (
          <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
            {authError}
          </p>
        )}
        <Button className="mt-5" onClick={signIn}>
          Sign in with Google
        </Button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">Signed in as {email}</p>
      {working !== null ? (
        <Working step={working} />
      ) : saved ? (
        <Result saved={saved} onChange={reset} />
      ) : (
        <FlightsStep onSubmit={submit} />
      )}
      <Button variant="outline" className="mt-8" onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    </Shell>
  );
}

const steps = [
  "Reading your flights",
  "Finding your airport coaches",
  "Finding you a room",
  "Picking your team",
];

function Working({ step }: { step: number }) {
  return (
    <ul className="mt-6 grid gap-3" aria-live="polite">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center gap-3 font-bold">
          {i < step ? (
            <Check aria-hidden="true" className="size-5 text-primary" />
          ) : i === step ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <span aria-hidden="true" className="size-5" />
          )}
          <span className={i > step ? "text-muted-foreground" : ""}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

const OTHER = "other";
const field = "h-11 w-full rounded-md border border-border bg-background px-3";

function LegPicker({
  title,
  direction,
  value,
  onChange,
}: {
  title: string;
  direction: "arrival" | "departure";
  value: DemoLeg | null;
  onChange: (leg: DemoLeg | null) => void;
}) {
  const options: FlightSuggestion[] = suggestionsFor(direction, tripDates[direction]);
  const [choice, setChoice] = useState("");
  const [flight, setFlight] = useState("");
  const [time, setTime] = useState("");

  function pick(next: string) {
    setChoice(next);
    if (next === OTHER) {
      onChange(flight.trim() && time ? { flight: flight.trim().toUpperCase(), time } : null);
      return;
    }
    const o = options[Number(next)];
    onChange(o ? { flight: o.display, time: o.time } : null);
  }
  function typed(f: string, t: string) {
    setFlight(f);
    setTime(t);
    onChange(f.trim() && t ? { flight: f.trim().toUpperCase(), time: t } : null);
  }

  return (
    <fieldset className="mt-5 rounded-md border border-border p-4">
      <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </legend>
      <select
        value={choice}
        onChange={(e) => pick(e.target.value)}
        aria-label={`${title}: pick a flight`}
        className={field}
      >
        <option value="">Pick your flight</option>
        {options.map((o, i) => (
          <option key={`${o.number}-${o.time}`} value={i}>
            {o.time} · {o.display} · {o.airline} · {o.route}
          </option>
        ))}
        <option value={OTHER}>Another flight (type it)</option>
      </select>
      {choice === OTHER && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            value={flight}
            onChange={(e) => typed(e.target.value, time)}
            placeholder="Flight, e.g. LX17"
            aria-label="Flight number"
            className={field}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => typed(flight, e.target.value)}
            aria-label={direction === "arrival" ? "Landing time" : "Take-off time"}
            className={field}
          />
        </div>
      )}
      {value && (
        <p className="mt-2 text-sm text-muted-foreground">
          {direction === "arrival" ? "Lands" : "Leaves"} Geneva at {value.time}
        </p>
      )}
    </fieldset>
  );
}

function FlightsStep({ onSubmit }: { onSubmit: (flights: DemoFlights, year: string) => void }) {
  const [arrival, setArrival] = useState<DemoLeg | null>(null);
  const [departure, setDeparture] = useState<DemoLeg | null>(null);
  const [year, setYear] = useState("");
  return (
    <>
      <h2 className="mt-6 font-display text-2xl uppercase">Your flights</h2>
      <LegPicker title="Getting there" direction="arrival" value={arrival} onChange={setArrival} />
      <LegPicker
        title="Getting back"
        direction="departure"
        value={departure}
        onChange={setDeparture}
      />
      <fieldset className="mt-5 rounded-md border border-border p-4">
        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Your year
        </legend>
        <div className="flex gap-6">
          {[
            ["first", "First year"],
            ["second", "Second year"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 font-bold">
              <input
                type="radio"
                name="year"
                value={value}
                checked={year === value}
                onChange={() => setYear(value!)}
                className="size-4"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <Button
        className="mt-6"
        disabled={!arrival || !departure || !year}
        onClick={() => arrival && departure && year && onSubmit({ arrival, departure }, year)}
      >
        Save and allocate me
      </Button>
    </>
  );
}

function CoachLine({ coach, leg }: { coach: DemoCoach; leg: DemoLeg }) {
  return (
    <div className="text-sm">
      <p className="font-bold">
        <Plane aria-hidden="true" className="mr-1 inline size-4" />
        {leg.flight} at {leg.time}
      </p>
      {coach.slot ? (
        <p>
          Coach <span className="font-bold">{coach.vehicle}</span> at{" "}
          <span className="font-bold">{coach.slot}</span>, seat {coach.seat} of {SEATS}
          {coach.why && <span className="text-muted-foreground"> ({coach.why})</span>}
        </p>
      ) : (
        <p className="text-muted-foreground">{coach.why}</p>
      )}
    </div>
  );
}

function Result({ saved, onChange }: { saved: Saved; onChange: () => void }) {
  const { flights, result } = saved;
  return (
    <>
      <h2 className="mt-6 font-display text-2xl uppercase">You're all set</h2>
      <Card icon={<Bus aria-hidden="true" className="size-4" />} title="Airport coaches">
        <div className="grid gap-4">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Sat 9 Jan, Geneva to Val Thorens</p>
            <CoachLine coach={result.arrival} leg={flights.arrival} />
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Sat 16 Jan, Val Thorens to Geneva</p>
            <CoachLine coach={result.departure} leg={flights.departure} />
          </div>
        </div>
      </Card>
      <Card icon={<BedDouble aria-hidden="true" className="size-4" />} title="Your room">
        <p className="font-bold">
          {result.room.residence}, room {result.room.room}
        </p>
        <p className="text-sm text-muted-foreground">
          {result.room.type} room, with {result.room.roommate}
        </p>
      </Card>
      <Card icon={<Users aria-hidden="true" className="size-4" />} title="Your team">
        <p className="font-bold">
          <span aria-hidden="true">{teamById(saved.team).emoji}</span> Team{" "}
          {teamById(saved.team).name}
        </p>
        <p className="text-sm text-muted-foreground">
          {saved.year === "first" ? "First" : "Second"} year, balanced across the four teams
        </p>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Test data: coaches, rooms and teams are pretend and only saved in this browser.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild>
          <a href="/crew#teams">Go to Crew</a>
        </Button>
        <Button variant="outline" onClick={onChange}>
          Start again
        </Button>
      </div>
    </>
  );
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-md border border-border p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
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
      <h1 className="font-display text-3xl uppercase">Try it</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
