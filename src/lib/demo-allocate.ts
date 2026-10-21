import { coachAfterLanding, coachBeforeTakeoff } from "@/lib/flight-suggestions";
import { allTestPeople } from "@/lib/test-guests";
import type { TestLeg, TestPerson } from "@/lib/test-persona";
import { airportCoaches } from "@/lib/trip";

// Test site only. Puts a newly signed-in person on an airport coach and in a
// room, using the same coach rules as the flight form and the 200 invented
// travellers as the crowd already on the coaches. Runs in the browser, so the
// result is the demo's, not anyone's real booking.
export const SEATS = 55;

export type DemoLeg = { flight: string; time: string };
export type DemoFlights = { arrival: DemoLeg; departure: DemoLeg };

export type DemoCoach = {
  slot: string | null;
  vehicle: string | null;
  seat: number | null;
  why: string;
};

export type DemoRoom = {
  residence: string;
  room: string;
  type: string;
  roommate: string;
};

export type DemoAllocation = {
  arrival: DemoCoach;
  departure: DemoCoach;
  room: DemoRoom;
};

// Half-full doubles held back for people who sign up now. Each already has one
// invented occupant, so the newcomer is matched with a roommate.
const spare: DemoRoom[] = [
  {
    residence: "Résidence Village Montana",
    room: "S01",
    type: "Double",
    roommate: "Lena Hartmann",
  },
  { residence: "Résidence Village Montana", room: "S02", type: "Double", roommate: "Tomas Reyes" },
  { residence: "Résidence Village Montana", room: "S03", type: "Double", roommate: "Anjali Rao" },
  { residence: "Résidence L’Oxalys", room: "S04", type: "Double", roommate: "Marcus Bell" },
  { residence: "Résidence L’Oxalys", room: "S05", type: "Double", roommate: "Yuki Tanaka" },
  {
    residence: "Hôtel Le Hameau du Kashmir",
    room: "KS6",
    type: "Double",
    roommate: "Camille Roux",
  },
];

function hash(text: string): number {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

// How many invented travellers are already on each coach, by leg, slot and name.
function load(leg: "arrival" | "departure") {
  const vehicles = new Map<string, { slot: string; riders: number }>();
  for (const p of allTestPeople()) {
    const { slot, vehicle } = p.coach[leg];
    if (!slot || !vehicle) continue;
    const v = vehicles.get(vehicle) ?? { slot, riders: 0 };
    v.riders += 1;
    vehicles.set(vehicle, v);
  }
  return vehicles;
}

function seatOn(leg: "arrival" | "departure", slot: string): DemoCoach {
  const vehicles = load(leg);
  const prefix = leg === "arrival" ? "A" : "D";
  const open = [...vehicles.entries()]
    .filter(([, v]) => v.slot === slot && v.riders < SEATS)
    .sort((a, b) => a[1].riders - b[1].riders)[0];
  if (open) return { slot, vehicle: open[0], seat: open[1].riders + 1, why: "" };
  // Every coach at that time is full: lay on another one.
  return { slot, vehicle: `${prefix}${vehicles.size + 1}`, seat: 1, why: "A new coach was added" };
}

export function allocate(email: string, flights: DemoFlights): DemoAllocation {
  const out = coachAfterLanding(flights.arrival.time, airportCoaches.out.times);
  const back = coachBeforeTakeoff(flights.departure.time, airportCoaches.home.coaches);
  return {
    arrival: out
      ? seatOn("arrival", out)
      : { slot: null, vehicle: null, seat: null, why: "Lands too late for the last coach (14:15)" },
    departure: back
      ? seatOn("departure", back)
      : {
          slot: null,
          vehicle: null,
          seat: null,
          why: "Flight is too early for the first coach (05:15)",
        },
    room: spare[hash(email.toLowerCase()) % spare.length]!,
  };
}

const ARRIVAL_DAY = "2027-01-09";
const DEPARTURE_DAY = "2027-01-16";

/** The traveller the test site keeps for someone who signed in with Google. */
export function toGuest(
  name: string,
  email: string,
  year: string,
  team: number,
  flights: DemoFlights,
  result: DemoAllocation,
): TestPerson {
  const leg = (l: DemoLeg, date: string): TestLeg => ({
    mode: "geneva",
    date,
    flight: l.flight,
    airline: "",
    route: "",
    airport: "GVA",
    time: l.time,
    shuttle: "yes",
  });
  const coach = (c: DemoCoach) => ({ slot: c.slot, vehicle: c.vehicle, why: c.why });
  return {
    id: `guest-${email}`,
    name,
    email,
    group: "guest",
    arrival: leg(flights.arrival, ARRIVAL_DAY),
    departure: leg(flights.departure, DEPARTURE_DAY),
    coach: { arrival: coach(result.arrival), departure: coach(result.departure) },
    room: {
      id: `guest-${result.room.room}`,
      residence: result.room.residence,
      room: result.room.room,
      type: result.room.type,
      roommates: [result.room.roommate],
    },
    year,
    team,
  };
}
