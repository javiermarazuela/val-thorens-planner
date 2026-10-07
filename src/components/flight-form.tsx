import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { Plane } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  coachAfterLanding,
  coachBeforeTakeoff,
  knownFlight,
  suggestionsFor,
  tripDates,
  type FlightSuggestion,
} from "@/lib/flight-suggestions";
import { lookupFlight, type FlightLookupResult } from "@/lib/flight-lookup.functions";
import { airportCoaches } from "@/lib/trip";
import { cn } from "@/lib/utils";

type Direction = "arrival" | "departure";
type Mode = "geneva" | "other_flight" | "other";
type Shuttle = "yes" | "no" | "unsure";
type Source = "lookup" | "suggested" | "manual";

// What the person has confirmed for one leg.
type Confirmed = { airport: string; time: string; source: Source };

// A flight we found and are asking "is this yours?" about.
type Proposal = {
  airline: string;
  number: string; // as booked, e.g. "LX17 + LX2802"
  route: string;
  airport: string;
  time: string;
  source: Source;
  note?: string | undefined;
};

type LegState = {
  mode: Mode;
  date: string;
  number: string;
  shuttle: Shuttle | "";
  note: string;
  confirmed: Confirmed | null;
};

type Row = {
  arr_mode: Mode | null;
  arr_note: string | null;
  arr_date: string | null;
  arr_flight: string | null;
  arr_airport: string | null;
  arr_time: string | null;
  arr_shuttle: Shuttle | null;
  arr_source: Source | null;
  dep_mode: Mode | null;
  dep_note: string | null;
  dep_date: string | null;
  dep_flight: string | null;
  dep_airport: string | null;
  dep_time: string | null;
  dep_shuttle: Shuttle | null;
  dep_source: Source | null;
};

const copy = {
  arrival: {
    title: "Arriving",
    genevaLabel: "Geneva · Sat 9 Jan",
    dateLabel: "Landing date",
    timeLabel: "Landing time",
    airportLabel: "Landing airport",
    verb: "lands",
    shuttleLabel: "Do you want a seat on the airport coach to Val Thorens?",
    noteLabel: "How are you getting here?",
    notePlaceholder: "e.g. train from Paris, driving, flying into Lyon on the 8th",
  },
  departure: {
    title: "Leaving",
    genevaLabel: "Geneva · Sat 16 Jan",
    dateLabel: "Flight date",
    timeLabel: "Take-off time",
    airportLabel: "Departing airport",
    verb: "leaves",
    shuttleLabel: "Do you want a seat on the airport coach from Val Thorens?",
    noteLabel: "How are you getting home?",
    notePlaceholder: "e.g. train to Paris, driving, flying from Lyon on the 17th",
  },
} as const;

const modes: { id: Mode; label: (d: Direction) => string }[] = [
  { id: "geneva", label: (d) => copy[d].genevaLabel },
  { id: "other_flight", label: () => "Another flight" },
  { id: "other", label: () => "Another way" },
];

const flightNumberRe = /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/;
const input =
  "min-h-11 w-full rounded-md border border-border bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const emptyLeg = (direction: Direction, mode: Mode = "geneva"): LegState => ({
  mode,
  date: mode === "other_flight" ? "" : tripDates[direction],
  number: "",
  shuttle: "",
  note: "",
  confirmed: null,
});

function shiftDay(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function legFromRow(row: Row, direction: Direction): LegState {
  const p = direction === "arrival" ? "arr" : "dep";
  const number = row[`${p}_flight`] ?? "";
  const time = row[`${p}_time`];
  const source = row[`${p}_source`];
  return {
    mode: row[`${p}_mode`] ?? "geneva",
    date: row[`${p}_date`] ?? tripDates[direction],
    number,
    shuttle: row[`${p}_shuttle`] ?? "",
    note: row[`${p}_note`] ?? "",
    confirmed:
      number && time && source
        ? { airport: row[`${p}_airport`] ?? "", time: time.slice(0, 5), source }
        : null,
  };
}

function legToRow(leg: LegState, p: "arr" | "dep") {
  const flying = leg.mode !== "other";
  const c = flying ? leg.confirmed : null;
  return {
    [`${p}_mode`]: leg.mode,
    [`${p}_note`]: leg.mode === "other" ? leg.note.trim() || null : null,
    [`${p}_date`]: flying ? leg.date || null : null,
    [`${p}_flight`]: c ? leg.number : null,
    [`${p}_airport`]: c?.airport || null,
    [`${p}_time`]: c?.time || null,
    [`${p}_shuttle`]: flying ? leg.shuttle || null : null,
    [`${p}_source`]: c?.source ?? null,
  };
}

export function FlightForm({
  supabase,
  session,
  showHeading = true,
}: {
  supabase: SupabaseClient;
  session: Session;
  showHeading?: boolean;
}) {
  const [arrival, setArrival] = useState<LegState>(emptyLeg("arrival"));
  const [departure, setDeparture] = useState<LegState>(emptyLeg("departure"));
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false); // a row exists for this person
  const [editing, setEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  // Loads this person's row. Used on first open and when they cancel an edit.
  function load() {
    supabase
      .from("flights")
      .select("*")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMessage({ kind: "error", text: "Couldn't load your flight details." });
        else if (data) {
          setArrival(legFromRow(data as Row, "arrival"));
          setDeparture(legFromRow(data as Row, "departure"));
          setSaved(true);
          setEditing(false);
        }
        setLoaded(true);
      });
  }

  useEffect(load, [supabase]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("flights").upsert({
      user_id: session.user.id,
      name: session.user.user_metadata?.["full_name"] ?? null,
      ...legToRow(arrival, "arr"),
      ...legToRow(departure, "dep"),
    });
    setSaving(false);
    if (error) {
      setMessage({ kind: "error", text: "Couldn't submit. Try again in a moment." });
      return;
    }
    setSaved(true);
    setEditing(false);
    setMessage({ kind: "ok", text: "Submitted. The committee can see your flights." });
  }

  function cancelEdit() {
    setMessage(null);
    load();
  }

  if (!loaded) return <p className="mt-6 text-muted-foreground">Loading your flights…</p>;

  const wrap = showHeading ? "mt-8 border-t border-border pt-8" : undefined;
  const heading = showHeading && <h2 className="font-display text-2xl uppercase">Your flights</h2>;
  const status = message && (
    <p
      role={message.kind === "error" ? "alert" : "status"}
      className={cn(
        "mt-4 text-sm font-semibold",
        message.kind === "error" ? "text-destructive" : "text-foreground",
      )}
    >
      {message.text}
    </p>
  );

  if (saved && !editing) {
    return (
      <div className={wrap}>
        {heading}
        <p className={cn("text-sm text-muted-foreground", showHeading && "mt-2")}>
          These are saved to your profile ({session.user.email}). You can change them any time.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Summary direction="arrival" leg={arrival} />
          <Summary direction="departure" leg={departure} />
        </div>
        {status}
        <Button className="mt-5" variant="outline" onClick={() => setEditing(true)}>
          Edit my flights
        </Button>
      </div>
    );
  }

  return (
    <div className={wrap}>
      {heading}
      <p className={cn("text-sm text-muted-foreground", showHeading && "mt-2")}>
        Tell us when you land and when you leave, and whether you want a seat on the airport coach.
        The committee uses this to plan the transfers. Signed in as {session.user.email}.
      </p>

      <div className="mt-6 grid gap-8">
        <LegEditor direction="arrival" leg={arrival} onChange={setArrival} session={session} />
        <LegEditor
          direction="departure"
          leg={departure}
          onChange={setDeparture}
          session={session}
        />
      </div>

      {status}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? "Submitting…" : saved ? "Save changes" : "Submit my flights"}
        </Button>
        {saved && (
          <Button variant="outline" onClick={cancelEdit} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

const shuttleText: Record<Shuttle, string> = {
  yes: "Wants the airport coach",
  no: "Making their own way",
  unsure: "Coach: not sure yet",
};

function Summary({ direction, leg }: { direction: Direction; leg: LegState }) {
  const t = copy[direction];
  let body: string;
  if (leg.mode === "other") body = leg.note ? `Another way: ${leg.note}` : "Another way";
  else if (leg.confirmed)
    body = `${leg.number} · ${leg.confirmed.airport ? `${leg.confirmed.airport} · ` : ""}${t.verb} ${leg.confirmed.time}`;
  else body = "No flight added yet";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="flex items-center gap-2 font-display text-sm uppercase">
        <Plane
          aria-hidden="true"
          className={cn("size-4", direction === "departure" && "rotate-45")}
        />
        {t.title}
      </p>
      <p className="mt-2 text-sm font-semibold">{body}</p>
      {leg.mode !== "other" && leg.shuttle && (
        <p className="mt-1 text-sm text-muted-foreground">{shuttleText[leg.shuttle]}</p>
      )}
    </div>
  );
}

function LegEditor({
  direction,
  leg,
  onChange,
  session,
}: {
  direction: Direction;
  leg: LegState;
  onChange: (next: LegState) => void;
  session: Session;
}) {
  const t = copy[direction];
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [status, setStatus] = useState<"idle" | "searching" | "missing">("idle");
  const [custom, setCustom] = useState(false); // "my flight isn't listed"
  const request = useRef(0);

  const number = leg.number.toUpperCase().replace(/\s+/g, "");
  const ready = flightNumberRe.test(number) && /^\d{4}-\d{2}-\d{2}$/.test(leg.date);
  const match = useMemo(
    () => (ready ? knownFlight(direction, leg.date, number) : undefined),
    [ready, direction, leg.date, number],
  );
  const known = match?.flight;
  // A found flight that doesn't touch Geneva: we ask for the Geneva leg too.
  const [partial, setPartial] = useState<Proposal | null>(null);
  const [second, setSecond] = useState("");
  const [secondStatus, setSecondStatus] = useState<"idle" | "searching" | "wrong" | "missing">(
    "idle",
  );
  const suggestions = leg.mode === "geneva" ? suggestionsFor(direction, leg.date) : [];
  const flying = leg.mode !== "other";
  const typing = leg.mode === "other_flight" || (leg.mode === "geneva" && custom);

  // A flight on the committee's list is matched on the spot: no API call.
  // Anything else waits for the "Look up" button, so half-typed numbers
  // ("UA9", "UA95") never spend a lookup.
  useEffect(() => {
    request.current++;
    setStatus("idle");
    setPartial(null);
    setSecond("");
    setSecondStatus("idle");
    setProposal(
      known && !leg.confirmed
        ? {
            ...fromSuggestion(known, direction),
            note: match?.part
              ? `${number} is one flight in this trip. Is the whole trip yours?`
              : undefined,
          }
        : null,
    );
  }, [known, match?.part, leg.confirmed, direction, number, leg.date]);

  function setMode(mode: Mode) {
    if (mode === leg.mode) return;
    request.current++;
    setProposal(null);
    setStatus("idle");
    setCustom(false);
    onChange({ ...emptyLeg(direction, mode), shuttle: leg.shuttle });
  }

  async function search() {
    const id = ++request.current;
    setStatus("searching");
    const found = await find(number, leg.date, direction, session.access_token);
    if (id !== request.current) return;
    if (!found) {
      setStatus("missing");
    } else if (leg.mode === "geneva" && found.airport !== "GVA") {
      setPartial(found);
      setStatus("idle");
    } else {
      setProposal(found);
      setStatus("idle");
    }
  }

  // The second flight, the one that touches Geneva. Free if it is on the
  // committee's list; otherwise cached lookup like any other.
  async function searchSecond() {
    if (!partial) return;
    const code = second.toUpperCase().replace(/\s+/g, "");
    if (!flightNumberRe.test(code)) {
      setSecondStatus("missing");
      return;
    }
    setSecondStatus("searching");
    const listed = knownFlight(direction, leg.date, code)?.flight;
    const leg2 = listed
      ? fromSuggestion(listed, direction)
      : await find(code, leg.date, direction, session.access_token);
    if (!leg2) return setSecondStatus("missing");
    if (leg2.airport !== "GVA") return setSecondStatus("wrong");
    const arriving = direction === "arrival";
    setPartial(null);
    setSecondStatus("idle");
    setProposal({
      ...leg2,
      number: arriving
        ? `${partial.number} + ${leg2.number}`
        : `${leg2.number} + ${partial.number}`,
      route: arriving
        ? `${partial.route}, then ${leg2.route}`
        : `${leg2.route}, then ${partial.route}`,
      airline: arriving ? leg2.airline : leg2.airline,
    });
  }

  function pick(s: FlightSuggestion) {
    request.current++;
    setStatus("idle");
    setProposal(fromSuggestion(s, direction));
    onChange({ ...leg, number: s.number, confirmed: null });
  }

  function confirm() {
    if (!proposal) return;
    onChange({
      ...leg,
      number: proposal.number,
      confirmed: { airport: proposal.airport, time: proposal.time, source: proposal.source },
    });
    setProposal(null);
  }

  function cancel() {
    request.current++;
    setProposal(null);
    setPartial(null);
    setSecond("");
    setSecondStatus("idle");
    setStatus("idle");
    onChange({ ...leg, number: "", confirmed: null });
  }

  const time = leg.confirmed?.time;
  const coach =
    time &&
    (direction === "arrival"
      ? coachAfterLanding(time, airportCoaches.out.times)
      : coachBeforeTakeoff(time, airportCoaches.home.coaches));

  return (
    <fieldset className="grid gap-4">
      <legend className="flex items-center gap-2 font-display text-lg uppercase">
        <Plane
          aria-hidden="true"
          className={cn("size-5", direction === "departure" && "rotate-45")}
        />
        {t.title}
      </legend>

      <div role="radiogroup" aria-label={`${t.title}: how`} className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={leg.mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              leg.mode === m.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-secondary",
            )}
          >
            {m.label(direction)}
          </button>
        ))}
      </div>

      {leg.mode === "other" && (
        <label className="grid gap-1 text-sm font-semibold">
          {t.noteLabel}
          <input
            type="text"
            maxLength={200}
            className={input}
            placeholder={t.notePlaceholder}
            value={leg.note}
            onChange={(e) => onChange({ ...leg, note: e.target.value })}
          />
          <span className="text-xs font-normal text-muted-foreground">
            No need for a flight. Just so the committee knows.
          </span>
        </label>
      )}

      {leg.mode === "geneva" && suggestions.length > 0 && !leg.confirmed && (
        <div>
          <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
            Pick your flight <StatusBadge status="preliminary" />
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {suggestions.map((s) => (
              <li key={s.display + s.time}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className={cn(
                    "w-full rounded-2xl border border-border bg-background px-4 py-2 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    number === s.number && "border-primary bg-secondary",
                  )}
                >
                  <span className="block text-sm">
                    <span className="font-extrabold tabular-nums">{s.time}</span>
                    <span className="text-muted-foreground"> · {s.route}</span>
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.airline} · <span className="font-bold text-foreground">{s.display}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!custom && (
            <button
              type="button"
              onClick={() => setCustom(true)}
              className="mt-3 min-h-8 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              My flight isn't listed
            </button>
          )}
        </div>
      )}

      {leg.mode === "geneva" && suggestions.length === 0 && !custom && !leg.confirmed && (
        <button
          type="button"
          onClick={() => setCustom(true)}
          className="min-h-8 justify-self-start text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          Enter my flight
        </button>
      )}

      {typing && !leg.confirmed && (
        <div className="grid gap-4 sm:grid-cols-2">
          {leg.mode === "other_flight" && (
            <label className="grid gap-1 text-sm font-semibold">
              {t.dateLabel}
              <input
                type="date"
                className={input}
                value={leg.date}
                onChange={(e) => onChange({ ...leg, date: e.target.value })}
              />
            </label>
          )}
          <label className="grid gap-1 text-sm font-semibold">
            Flight number
            <input
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="e.g. UA956"
              className={input}
              value={leg.number}
              onChange={(e) => onChange({ ...leg, number: e.target.value.toUpperCase() })}
            />
          </label>
        </div>
      )}

      {typing &&
        ready &&
        !known &&
        !leg.confirmed &&
        !proposal &&
        !partial &&
        status !== "missing" && (
          <div>
            <Button size="sm" variant="outline" onClick={search} disabled={status === "searching"}>
              {status === "searching" ? "Looking up…" : `Look up ${number}`}
            </Button>
          </div>
        )}

      {partial && (
        <div
          role="group"
          aria-label="Add the flight that touches Geneva"
          className="grid gap-3 rounded-xl border border-primary/40 bg-secondary p-4"
        >
          <p className="text-sm">
            <b>{partial.number}</b>
            {partial.route && ` (${partial.route})`}{" "}
            {direction === "arrival" ? "doesn't land in Geneva." : "doesn't leave from Geneva."}{" "}
            Please add your{" "}
            {direction === "arrival"
              ? "second flight, the one into Geneva"
              : "other flight, the one out of Geneva"}
            .
          </p>
          <label className="grid gap-1 text-sm font-semibold">
            Flight number
            <input
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="e.g. LX2802"
              className={input}
              value={second}
              onChange={(e) => {
                setSecond(e.target.value.toUpperCase());
                setSecondStatus("idle");
              }}
            />
          </label>
          {secondStatus === "missing" && (
            <p className="text-sm text-muted-foreground">
              We couldn't find that flight. Check the number and try again.
            </p>
          )}
          {secondStatus === "wrong" && (
            <p className="text-sm text-muted-foreground">
              That one doesn't {direction === "arrival" ? "land in" : "leave from"} Geneva either.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={searchSecond}
              disabled={secondStatus === "searching" || !second}
            >
              {secondStatus === "searching" ? "Looking up…" : "Find it"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {proposal && (
        <div
          role="group"
          aria-label="Confirm this flight"
          className="rounded-xl border border-primary/40 bg-secondary p-4"
        >
          <p className="text-sm font-semibold">{proposal.note ?? "Is this your flight?"}</p>
          <p className="mt-1 font-display text-xl uppercase">
            {proposal.number}
            {proposal.airline && <span className="text-base"> · {proposal.airline}</span>}
          </p>
          <p className="mt-1 text-sm">
            {proposal.route && `${proposal.route} · `}
            {t.verb} {proposal.time}
            {proposal.source === "suggested" && (
              <span className="text-muted-foreground"> (from the committee's list)</span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={confirm}>
              Yes, that's it
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {typing && status === "missing" && !leg.confirmed && (
        <ManualEntry
          label={t}
          onUse={(airport, manualTime) =>
            onChange({
              ...leg,
              number,
              confirmed: { airport, time: manualTime, source: "manual" },
            })
          }
        />
      )}

      {flying && leg.confirmed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
          <p className="text-sm">
            <span className="font-extrabold">{leg.number}</span>
            {" · "}
            {leg.confirmed.airport && `${leg.confirmed.airport} · `}
            {t.verb} {leg.confirmed.time}
            <span className="ml-2 font-semibold text-foreground">Confirmed</span>
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCustom(false);
              onChange({ ...leg, number: "", confirmed: null });
            }}
          >
            Change
          </Button>
        </div>
      )}

      {flying && leg.confirmed && (
        <label className="grid gap-1 text-sm font-semibold">
          {t.shuttleLabel}
          <select
            className={input}
            value={leg.shuttle}
            onChange={(e) => onChange({ ...leg, shuttle: e.target.value as Shuttle | "" })}
          >
            <option value="">Choose…</option>
            <option value="yes">Yes</option>
            <option value="no">No, I'll make my own way</option>
            <option value="unsure">Not sure yet</option>
          </select>
        </label>
      )}

      {flying && leg.confirmed && coach && leg.shuttle !== "no" && (
        <p className="text-sm text-muted-foreground">
          {direction === "arrival"
            ? `The ${coach} coach from Geneva looks like your best fit.`
            : `The ${coach} coach from Val Thorens gets you there in good time.`}{" "}
          Times are still to be confirmed. <StatusBadge status="preliminary" />
        </p>
      )}
    </fieldset>
  );
}

function ManualEntry({
  label,
  onUse,
}: {
  label: (typeof copy)[Direction];
  onUse: (airport: string, time: string) => void;
}) {
  const [airport, setAirport] = useState("GVA");
  const [time, setTime] = useState("");
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-background p-4">
      <p className="text-sm">
        We couldn't find that flight. Check the number, or enter the details yourself.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          {label.airportLabel}
          <input
            className={input}
            maxLength={3}
            value={airport}
            onChange={(e) => setAirport(e.target.value.toUpperCase())}
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          {label.timeLabel}
          <input
            type="time"
            className={input}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>
      <div>
        <Button
          size="sm"
          disabled={!time || airport.length !== 3}
          onClick={() => onUse(airport, time)}
        >
          Use these details
        </Button>
      </div>
    </div>
  );
}

function fromSuggestion(s: FlightSuggestion, direction: Direction): Proposal {
  return {
    airline: s.airline,
    number: s.display,
    route: s.route,
    airport: (direction === "arrival" ? s.to : s.from) || "GVA",
    time: s.time,
    source: "suggested",
  };
}

// Overnight flights leave the day before they land, and the API is asked by
// departure date. So for an arrival, also try the day before and keep the
// result that lands on the chosen date.
async function find(
  number: string,
  date: string,
  direction: Direction,
  accessToken: string,
): Promise<Proposal | null> {
  const dates = direction === "arrival" ? [shiftDay(date, -1), date] : [date];
  for (const d of dates) {
    let result: FlightLookupResult;
    try {
      result = await lookupFlight({ data: { accessToken, number, date: d } });
    } catch {
      return null;
    }
    if (!result.found) continue;
    if (direction === "arrival" && result.to === "GVA" && result.arrDate !== date) continue;
    return {
      airline: result.airline,
      number: result.number,
      route: result.from && result.to ? `${result.from} → ${result.to}` : "",
      airport: direction === "arrival" ? result.to : result.from,
      time: direction === "arrival" ? result.arrTime : result.depTime,
      source: "lookup",
    };
  }
  return null;
}
