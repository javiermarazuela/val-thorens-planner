import { gettingHere, knownFlights, type Flight } from "@/lib/trip";

// Chips for the flight form, built from the committee's flights list in
// trip.ts so there is one source. Flights there can have several legs
// ("LX17 + LX2802") and codeshares ("LX23 / UA9719"). The chip carries the
// leg that touches Geneva: the last leg coming in, the first leg going out.
export type FlightSuggestion = {
  direction: "arrival" | "departure";
  date: string; // yyyy-mm-dd
  time: string; // hh:mm, local, at Geneva
  airline: string;
  number: string; // the leg that touches Geneva; the lookup key
  display: string; // the whole itinerary as booked, e.g. "LX17 + LX2802"
  codes: string[]; // every flight code in it, codeshares included, for matching
  route: string; // e.g. "JFK → ZRH → GVA"
  from?: string;
  to?: string;
};

export const tripDates = { arrival: "2027-01-09", departure: "2027-01-16" };

function legNumber(raw: Flight["number"], which: "first" | "last"): string {
  const legs = raw.split("+").map((leg) => leg.trim());
  const leg = which === "first" ? legs[0] : legs[legs.length - 1];
  return (leg ?? raw).split("/")[0]!.trim().replace(/\s+/g, "");
}

// "LX17 + LX2802", "LX23 / UA9719": one code per leg, the first listed.
function itinerary(raw: Flight["number"]): string {
  return raw
    .split("+")
    .map((leg) => leg.split("/")[0]!.trim().replace(/\s+/g, ""))
    .join(" + ");
}

// Every code in "DL9357 / KL642 + DL9618 / KL1929", brackets and spaces dropped.
function allCodes(raw: string): string[] {
  return raw
    .split(/[+/]/)
    .map((c) =>
      c
        .replace(/\(.*?\)/g, "")
        .replace(/\s+/g, "")
        .toUpperCase(),
    )
    .filter((c) => /^[A-Z0-9]{2}\d{1,4}[A-Z]?$/.test(c));
}

function ends(route: string): { from: string; to: string } {
  const stops = route.split("→").map((x) => x.trim());
  return { from: stops[0] ?? "", to: stops[stops.length - 1] ?? "" };
}

function build(flights: Flight[], direction: FlightSuggestion["direction"]): FlightSuggestion[] {
  const seen = new Set<string>();
  const out: FlightSuggestion[] = [];
  for (const f of flights) {
    const arriving = direction === "arrival";
    const number = legNumber(f.number, arriving ? "last" : "first");
    const time = arriving ? f.arr : f.dep;
    const key = `${number}-${time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      direction,
      date: arriving ? tripDates.arrival : tripDates.departure,
      time,
      airline: f.airline,
      number,
      display: itinerary(f.number),
      codes: allCodes(f.number),
      route: f.route,
      ...ends(f.route),
    });
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

// Hand-typed flights come first and win over the derived ones on a clash.
const known: FlightSuggestion[] = knownFlights.map((k) => ({
  direction: k.direction,
  date: k.date,
  time: k.time,
  airline: k.airline,
  number: k.number.toUpperCase().replace(/\s+/g, ""),
  display: k.number.toUpperCase(),
  codes: allCodes(k.number),
  route: `${k.from} → ${k.to}`,
  from: k.from,
  to: k.to,
}));

export const flightSuggestions: FlightSuggestion[] = [
  ...known,
  ...build(gettingHere.out.flights, "arrival"),
  ...build(gettingHere.home.flights, "departure"),
].filter(
  (s, i, all) =>
    all.findIndex(
      (o) => o.direction === s.direction && o.date === s.date && o.number === s.number,
    ) === i,
);

/**
 * A flight we already know about, so no lookup is needed. Matches any leg or
 * codeshare of a listed itinerary, so typing LX17 (the first leg of LX17 +
 * LX2802) finds the whole trip. `part` is true when the match is not the
 * Geneva leg itself.
 */
export function knownFlight(
  direction: FlightSuggestion["direction"],
  date: string,
  number: string,
): { flight: FlightSuggestion; part: boolean } | undefined {
  const same = flightSuggestions.filter((s) => s.direction === direction && s.date === date);
  const exact = same.find((s) => s.number === number);
  if (exact) return { flight: exact, part: false };
  const other = same.find((s) => s.codes.includes(number));
  return other ? { flight: other, part: true } : undefined;
}

export function suggestionsFor(
  direction: FlightSuggestion["direction"],
  date: string,
): FlightSuggestion[] {
  return flightSuggestions.filter((s) => s.direction === direction && s.date === date);
}

/** Coach that suits a landing time at Geneva: the first one at least 1h after. */
export function coachAfterLanding(time: string, coachTimes: string[]): string | null {
  const mins = toMinutes(time) + 60;
  return coachTimes.find((c) => toMinutes(c) >= mins) ?? null;
}

/** Latest coach that still leaves at least `gap` hours before take-off. */
export function coachBeforeTakeoff(
  time: string,
  coaches: { time: string }[],
  gapHours = 5,
): string | null {
  const limit = toMinutes(time) - gapHours * 60;
  const fits = coaches.filter((c) => toMinutes(c.time) <= limit);
  return fits.length ? fits[fits.length - 1]!.time : null;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** The airline the list gives for a flight, found from its number. */
export function airlineForNumber(
  number: string,
  direction: FlightSuggestion["direction"],
): string | undefined {
  return flightSuggestions.find((s) => s.direction === direction && s.display === number)?.airline;
}
