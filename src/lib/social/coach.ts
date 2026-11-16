import { coachAfterLanding, coachBeforeTakeoff } from "@/lib/flight-suggestions";
import { airportCoaches } from "@/lib/trip";

import type { Leg } from "./types";

export type Direction = "arrival" | "departure";

const ARRIVAL_DAY = "2027-01-09";
const DEPARTURE_DAY = "2027-01-16";

/**
 * The airport coach a leg would take, by the same rules the flight form uses to
 * suggest one. Null for anyone not on a Geneva coach (other airports, trains,
 * other days, or "no coach"). Coach times are preliminary until confirmed.
 */
export function coachFor(leg: Leg, direction: Direction): string | null {
  if (leg.mode !== "geneva" || leg.airport !== "GVA" || !leg.time) return null;
  if (leg.shuttle !== "yes") return null;
  if (direction === "arrival") {
    if (leg.date !== ARRIVAL_DAY) return null;
    return coachAfterLanding(leg.time, airportCoaches.out.times);
  }
  if (leg.date !== DEPARTURE_DAY) return null;
  return coachBeforeTakeoff(leg.time, airportCoaches.home.coaches);
}

/** Same flight on the same day. */
export function sameFlight(a: Leg, b: Leg): boolean {
  return !!a.flight && !!a.date && a.flight === b.flight && a.date === b.date && a.mode !== "other";
}
