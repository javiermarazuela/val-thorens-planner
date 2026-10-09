// Builds 200 imaginary travellers for the test site: how each one gets to and
// from Val Thorens, which airport coach they would be on, and which room they
// share. Everything is invented. Re-run with `node scripts/gen-test-data.mjs`;
// the seed is fixed, so the output is the same every time.
//
// Reads the real recommended flights and coach times from src/lib/trip.ts and
// uses the same coach rules as the flight form (src/lib/flight-suggestions.ts),
// so what the test data says about coaches matches what the live site would say.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { gettingHere, airportCoaches } = await import(
  new URL("../src/lib/trip.ts", import.meta.url).href
);

// ---------- seeded random ----------------------------------------------------
let seed = 20270109;
function rnd() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = (list) => list[Math.floor(rnd() * list.length)];
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function weighted(items, weights) {
  let r = rnd() * weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r < 0) return items[i];
  }
  return items[items.length - 1];
}

// ---------- coach rules (same as src/lib/flight-suggestions.ts) --------------
const mins = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const hhmm = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const coachAfterLanding = (time, times) => times.find((c) => mins(c) >= mins(time) + 60) ?? null;
function coachBeforeTakeoff(time, coaches, gapHours = 5) {
  const fits = coaches.filter((c) => mins(c.time) <= mins(time) - gapHours * 60);
  return fits.length ? fits[fits.length - 1].time : null;
}

// ---------- names ------------------------------------------------------------
const firsts =
  `Aarav Adaeze Adrian Aiko Alessandra Alex Amara Amelia Andre Anika Antonio Arjun Ava Beatriz Benjamin Bianca Camila Carlos Chen Chloe Clara Daniel Daria David Diego Elena Elias Emma Ethan Fatima Felix Gabriel Giulia Grace Hana Hannah Henry Hiro Ibrahim Ines Isabella Jack Jamal Javier Jin Joao Julia Kai Kavya Khalid Lara Leo Liam Lina Lucas Luisa Madison Mateo Maya Mei Mia Mohamed Nadia Naomi Nathan Nia Noah Nora Olivia Omar Oscar Owen Priya Rafael Rahul Rania Rosa Ryan Sakura Samir Sara Sebastian Sofia Soren Tara Theo Thomas Valentina Victor Wei Yara Yusuf Zara Zoe`.split(
    /\s+/,
  );
const lasts =
  `Abbott Ahmed Alvarez Andersson Bailey Banerjee Becker Bianchi Brooks Campbell Carter Castillo Chang Chopra Clarke Cohen Costa Cruz Dang Das Delgado Diaz Dubois Edwards Evans Fernandez Fischer Flores Foster Garcia Gonzalez Gupta Hall Hansen Harper Hernandez Hoffman Huang Hughes Ibrahim Ito Jackson Jensen Johansson Kapoor Kaur Khan Kim Klein Kowalski Lam Larsen Lee Lewis Li Lopez Lund Madsen Malik Martin Martinez Mehta Meyer Mitchell Moreau Morgan Murphy Nakamura Nguyen Nielsen Novak Okafor Oliveira Ortiz Park Patel Perez Petrov Pham Quinn Ramirez Reid Rivera Rossi Roy Russo Sanchez Santos Schmidt Shah Silva Singh Sorensen Suzuki Tan Taylor Torres Tran Vargas Wagner Walker Wang Weber Williams Wong Wright Yamamoto Young Zhang Zhou`.split(
    /\s+/,
  );

function makeNames(n) {
  const used = new Set();
  const out = [];
  while (out.length < n) {
    const first = pick(firsts);
    const last = pick(lasts);
    const key = `${first} ${last}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push({ name: key, email: `${first}.${last}`.toLowerCase() + "@gsb.columbia.test" });
  }
  return out;
}

// ---------- flights ----------------------------------------------------------
// Same helpers as flight-suggestions.ts: the form stores the leg that touches
// Geneva, so the last leg coming in and the first leg going out.
function legNumber(raw, which) {
  const legs = raw.split("+").map((l) => l.trim());
  const leg = which === "first" ? legs[0] : legs[legs.length - 1];
  return (leg ?? raw).split("/")[0].trim().replace(/\s+/g, "");
}
function display(raw) {
  return raw
    .split("+")
    .map((l) => l.split("/")[0].trim().replace(/\s+/g, ""))
    .join(" + ");
}
const ends = (route) => {
  const s = route.split("→").map((x) => x.trim());
  return { from: s[0], to: s[s.length - 1] };
};

const outFlights = gettingHere.out.flights;
const homeFlights = gettingHere.home.flights;
// How popular each recommended flight is, in the same order as trip.ts.
const outWeights = [14, 14, 10, 10, 6, 4, 12, 10, 8, 12];
const homeWeights = [16, 14, 6, 5, 3, 6, 10, 5, 10, 8, 9, 8];
if (outWeights.length !== outFlights.length || homeWeights.length !== homeFlights.length) {
  throw new Error("trip.ts flights changed: update the weights in gen-test-data.mjs");
}

const ARR_DATE = "2027-01-09";
const DEP_DATE = "2027-01-16";
const shiftDate = (iso, days) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function recommendedArrival(date = ARR_DATE) {
  const f = weighted(outFlights, outWeights);
  return {
    mode: "geneva",
    date,
    flight: legNumber(f.number, "last"),
    itinerary: display(f.number),
    airline: f.airline,
    route: f.route,
    origin: ends(f.route).from,
    airport: "GVA",
    time: f.arr,
    source: "suggested",
  };
}
function recommendedDeparture(date = DEP_DATE) {
  const f = weighted(homeFlights, homeWeights);
  return {
    mode: "geneva",
    date,
    flight: legNumber(f.number, "first"),
    itinerary: display(f.number),
    airline: f.airline,
    route: f.route,
    origin: ends(f.route).to,
    airport: "GVA",
    time: f.dep,
    source: "suggested",
  };
}

// Invented flights from elsewhere. Numbers are made up and not real schedules.
const europe = [
  ["LHR", "British Airways", "BA"],
  ["LHR", "easyJet", "U2"],
  ["CDG", "Air France", "AF"],
  ["FRA", "Lufthansa", "LH"],
  ["AMS", "KLM", "KL"],
  ["ZRH", "Swiss", "LX"],
  ["MAD", "Iberia", "IB"],
  ["BCN", "Vueling", "VY"],
  ["MXP", "ITA Airways", "AZ"],
  ["DUB", "Aer Lingus", "EI"],
  ["CPH", "SAS", "SK"],
  ["LIS", "TAP", "TP"],
  ["BRU", "Brussels Airlines", "SN"],
  ["VIE", "Austrian", "OS"],
  ["ARN", "SAS", "SK"],
  ["LGW", "easyJet", "U2"],
  ["EDI", "easyJet", "U2"],
  ["BER", "Lufthansa", "LH"],
];
const americas = [
  ["BOS", "LHR", "British Airways", "BA"],
  ["BOS", "ZRH", "Swiss", "LX"],
  ["ORD", "FRA", "Lufthansa", "LH"],
  ["ORD", "LHR", "United", "UA"],
  ["YYZ", "ZRH", "Swiss", "LX"],
  ["YYZ", "FRA", "Air Canada", "AC"],
  ["YUL", "CDG", "Air France", "AF"],
  ["MIA", "MAD", "Iberia", "IB"],
  ["SFO", "FRA", "Lufthansa", "LH"],
  ["LAX", "LHR", "British Airways", "BA"],
  ["IAD", "ZRH", "Swiss", "LX"],
  ["ATL", "AMS", "Delta", "DL"],
  ["MEX", "MAD", "Iberia", "IB"],
  ["GRU", "LIS", "TAP", "TP"],
  ["BOG", "MAD", "Avianca", "AV"],
  ["SCL", "MAD", "LATAM", "LA"],
];
const flightNo = (code) => `${code}${int(100, 2999)}`;
const slot5 = (a, b) => hhmm(5 * int(Math.ceil(mins(a) / 5), Math.floor(mins(b) / 5)));

function europeLeg(direction) {
  const [airport, airline, code] = pick(europe);
  const arriving = direction === "arrival";
  // Most people book to suit the coaches; some don't.
  const fits = rnd() < 0.85;
  const time = arriving
    ? fits
      ? slot5("07:30", "13:00")
      : slot5("13:00", "20:00")
    : fits
      ? slot5("10:15", "19:30")
      : slot5("06:45", "10:15");
  return {
    mode: "geneva",
    date: arriving ? ARR_DATE : DEP_DATE,
    flight: flightNo(code),
    airline,
    route: arriving ? `${airport} → GVA` : `GVA → ${airport}`,
    origin: airport,
    airport: "GVA",
    time,
    source: pick(["lookup", "lookup", "manual"]),
  };
}
function americasLeg(direction) {
  const [origin, hub, airline, code] = pick(americas);
  const arriving = direction === "arrival";
  const fits = rnd() < 0.8;
  const time = arriving
    ? fits
      ? slot5("08:00", "13:00")
      : slot5("13:00", "20:00")
    : fits
      ? slot5("10:15", "17:30")
      : slot5("07:00", "10:15");
  return {
    mode: "geneva",
    date: arriving ? ARR_DATE : DEP_DATE,
    flight: flightNo(code),
    airline,
    route: arriving ? `${origin} → ${hub} → GVA` : `GVA → ${hub} → ${origin}`,
    origin,
    airport: "GVA",
    time,
    source: pick(["lookup", "manual"]),
  };
}

// ---------- people -----------------------------------------------------------
const plan = [
  ["recommended", 100],
  ["europe", 40],
  ["americas", 20],
  ["early-arrival", 10],
  ["late-departure", 10],
  ["lyon", 10],
  ["paris", 10],
];
const total = plan.reduce((s, [, n]) => s + n, 0);
if (total !== 200) throw new Error(`plan adds up to ${total}, not 200`);

const names = makeNames(200);
const groups = shuffle(plan.flatMap(([g, n]) => Array(n).fill(g)));

function arrivalShuttle(group) {
  if (group === "lyon" || group === "paris") return "no";
  return weighted(["yes", "no", "unsure"], [88, 8, 4]);
}

const people = names.map((p, i) => {
  const group = groups[i];
  let arrival;
  let departure;

  if (group === "recommended") {
    arrival = recommendedArrival();
    departure = recommendedDeparture();
  } else if (group === "europe") {
    arrival = europeLeg("arrival");
    departure = europeLeg("departure");
  } else if (group === "americas") {
    arrival = americasLeg("arrival");
    departure = americasLeg("departure");
  } else if (group === "early-arrival") {
    arrival = recommendedArrival(shiftDate(ARR_DATE, -int(1, 2)));
    arrival.note = "Already in Geneva before the trip, joins a coach on 9 Jan";
    departure = recommendedDeparture();
  } else if (group === "late-departure") {
    arrival = recommendedArrival();
    departure = recommendedDeparture(shiftDate(DEP_DATE, int(1, 2)));
    departure.note = "Staying on after the trip, leaves Geneva later";
  } else if (group === "lyon") {
    const t = slot5("07:00", "15:30");
    arrival = {
      mode: "other_flight",
      date: ARR_DATE,
      flight: flightNo(pick(["AF", "U2", "LH", "KL"])),
      airline: "",
      route: `${pick(["CDG", "LHR", "AMS", "FRA"])} → LYS`,
      origin: "",
      airport: "LYS",
      time: t,
      source: "manual",
      note: "Flying into Lyon (LYS), then a bus up the valley",
    };
    const d = slot5("08:00", "18:00");
    departure = {
      mode: "other_flight",
      date: DEP_DATE,
      flight: flightNo(pick(["AF", "U2", "LH", "KL"])),
      airline: "",
      route: "LYS → CDG",
      origin: "",
      airport: "LYS",
      time: d,
      source: "manual",
      note: "Bus down to Lyon (LYS) airport",
    };
  } else {
    arrival = {
      mode: "other",
      date: ARR_DATE,
      flight: "",
      airline: "",
      route: "",
      origin: "",
      airport: "",
      time: "",
      source: "manual",
      note: `TGV from Paris, arriving Moûtiers around ${slot5("11:00", "17:00")}, then a bus or taxi up`,
    };
    departure = {
      mode: "other",
      date: DEP_DATE,
      flight: "",
      airline: "",
      route: "",
      origin: "",
      airport: "",
      time: "",
      source: "manual",
      note: `Taxi or bus to Moûtiers, TGV to Paris around ${slot5("08:00", "13:00")}`,
    };
  }

  arrival.shuttle = arrivalShuttle(group);
  departure.shuttle =
    group === "late-departure"
      ? "no"
      : group === "lyon" || group === "paris"
        ? "no"
        : weighted(["yes", "no", "unsure"], [88, 8, 4]);

  return {
    id: `t${String(i + 1).padStart(3, "0")}`,
    name: p.name,
    email: p.email,
    group,
    arrival,
    departure,
    coach: { arrival: null, departure: null },
    room: null,
  };
});

// ---------- coaches ----------------------------------------------------------
const SEATS = 55;
const outTimes = airportCoaches.out.times;
const homeCoaches = airportCoaches.home.coaches;

function slotFor(person, leg) {
  if (leg === "arrival") {
    const a = person.arrival;
    if (a.shuttle !== "yes" || a.mode !== "geneva")
      return {
        slot: null,
        why:
          a.mode !== "geneva"
            ? "Not coming through Geneva"
            : a.shuttle === "no"
              ? "Not taking the coach"
              : "Not decided yet",
      };
    if (a.date !== ARR_DATE) {
      // Already in Geneva: picks a coach on the 9th.
      return { slot: weighted(outTimes, [3, 5, 2]), why: "Already in Geneva, joins on the 9th" };
    }
    const slot = coachAfterLanding(a.time, outTimes);
    return { slot, why: slot ? "" : "Lands too late for the last coach (14:15)" };
  }
  const d = person.departure;
  if (d.shuttle !== "yes" || d.mode !== "geneva")
    return {
      slot: null,
      why:
        d.mode !== "geneva"
          ? "Not flying from Geneva"
          : d.shuttle === "no"
            ? "Not taking the coach"
            : "Not decided yet",
    };
  if (d.date !== DEP_DATE) return { slot: null, why: "Leaves after the trip" };
  const slot = coachBeforeTakeoff(d.time, homeCoaches);
  return { slot, why: slot ? "" : "Flight is too early for the first coach (05:15)" };
}

function fill(leg, prefix, times) {
  const bySlot = new Map(times.map((t) => [t, []]));
  for (const p of people) {
    const { slot, why } = slotFor(p, leg);
    p.coach[leg] = { slot, vehicle: null, why };
    if (slot) bySlot.get(slot).push(p);
  }
  let n = 0;
  const vehicles = [];
  for (const t of times) {
    const list = bySlot.get(t);
    // Earliest landing (or latest take-off) first, so each coach is a similar crowd.
    list.sort((a, b) => (a[leg].time || "").localeCompare(b[leg].time || ""));
    // As few coaches as fit, with the people spread evenly between them.
    const count = Math.ceil(list.length / SEATS);
    const share = Math.ceil(list.length / count);
    for (let v = 0; v < count; v++) {
      n += 1;
      const name = `${prefix}${n}`;
      const seats = list.slice(v * share, (v + 1) * share);
      seats.forEach((p) => (p.coach[leg].vehicle = name));
      vehicles.push({ vehicle: name, time: t, people: seats.length });
    }
  }
  return vehicles;
}
const arrivalVehicles = fill("arrival", "A", outTimes);
const departureVehicles = fill(
  "departure",
  "D",
  homeCoaches.map((c) => c.time),
);

// ---------- rooms ------------------------------------------------------------
// Mostly doubles, a few triples and quads. Hotel Kashmir is doubles only.
const layout = [
  {
    residence: "Résidence Village Montana",
    key: "montana",
    doubles: 66,
    triples: 4,
    quads: 4,
    label: (f, r) => `${f}${String(r).padStart(2, "0")}`,
  },
  {
    residence: "Résidence L’Oxalys",
    key: "oxalys",
    doubles: 9,
    triples: 2,
    quads: 0,
    label: (f, r) => `${f}${String(r).padStart(2, "0")}`,
  },
  {
    residence: "Hôtel Le Hameau du Kashmir",
    key: "kashmir",
    doubles: 8,
    triples: 0,
    quads: 0,
    label: (f, r) => `K${f}${String(r).padStart(2, "0")}`,
  },
];
const needed = layout.reduce((s, l) => s + l.doubles * 2 + l.triples * 3 + l.quads * 4, 0);
if (needed !== 200) throw new Error(`rooms hold ${needed} people, not 200`);

const queue = shuffle(people);
let cursor = 0;
const rooms = [];
for (const l of layout) {
  const sizes = shuffle([
    ...Array(l.doubles).fill(2),
    ...Array(l.triples).fill(3),
    ...Array(l.quads).fill(4),
  ]);
  sizes.forEach((size, idx) => {
    const floor = 1 + Math.floor(idx / 12);
    const label = l.label(floor, (idx % 12) + 1);
    const members = queue.slice(cursor, cursor + size);
    cursor += size;
    const roomId = `${l.key}-${label.toLowerCase()}`;
    const type = size === 2 ? "Double" : size === 3 ? "Triple" : "Quad";
    members.forEach((m) => {
      m.room = {
        id: roomId,
        residence: l.residence,
        room: label,
        type,
        roommates: members.filter((o) => o.id !== m.id).map((o) => o.name),
      };
    });
    rooms.push({ id: roomId, residence: l.residence, room: label, type, size });
  });
}

// ---------- write ------------------------------------------------------------
const outDir = join(root, "src", "test-data");
const csvDir = join(root, "test-data");
mkdirSync(outDir, { recursive: true });
mkdirSync(csvDir, { recursive: true });

const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(
  join(outDir, "people.json"),
  JSON.stringify(
    {
      note: "Invented test data. Not real people or real schedules.",
      people: sorted,
      rooms,
      arrivalVehicles,
      departureVehicles,
    },
    null,
    1,
  ) + "\n",
);

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (header, rows) =>
  "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n";
const dayLabel = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

writeFileSync(
  join(csvDir, "Rooms.csv"),
  csv(
    ["Email", "Name", "Residence", "Room", "Note"],
    sorted.map((p) => [p.email, p.name, p.room.residence, p.room.room, `${p.room.type} room`]),
  ),
);

writeFileSync(
  join(csvDir, "Shuttles.csv"),
  csv(
    [
      "Email",
      "Name",
      "Arrival coach",
      "Arrival time",
      "Arrival pick-up",
      "Departure coach",
      "Departure time",
      "Departure pick-up",
      "Note",
    ],
    sorted.map((p) => {
      const a = p.coach.arrival;
      const d = p.coach.departure;
      const notes = [a.slot ? "" : `Arrival: ${a.why}`, d.slot ? "" : `Departure: ${d.why}`]
        .filter(Boolean)
        .join(". ");
      return [
        p.email,
        p.name,
        a.vehicle ? `Coach ${a.vehicle}` : "",
        a.slot ? `${dayLabel(ARR_DATE)}, ${a.slot}` : "",
        a.slot ? "Geneva airport arrivals (test data)" : "",
        d.vehicle ? `Coach ${d.vehicle}` : "",
        d.slot ? `${dayLabel(DEP_DATE)}, ${d.slot}` : "",
        d.slot ? "Outside the residence (test data)" : "",
        notes,
      ];
    }),
  ),
);

const leg = (l) => [l.mode, l.date, l.flight, l.route, l.airport, l.time, l.shuttle, l.note ?? ""];
writeFileSync(
  join(csvDir, "Flights.csv"),
  csv(
    [
      "Name",
      "Email",
      "Group",
      "Arrival: how",
      "Arrival date",
      "Arrival flight",
      "Arrival route",
      "Arrival airport",
      "Arrival time",
      "Arrival coach?",
      "Arrival note",
      "Departure: how",
      "Departure date",
      "Departure flight",
      "Departure route",
      "Departure airport",
      "Departure time",
      "Departure coach?",
      "Departure note",
    ],
    sorted.map((p) => [p.name, p.email, p.group, ...leg(p.arrival), ...leg(p.departure)]),
  ),
);

// ---------- summary ----------------------------------------------------------
const count = (list, f) => list.reduce((m, x) => ((m[f(x)] = (m[f(x)] ?? 0) + 1), m), {});
console.log("people:", people.length);
console.log(
  "groups:",
  count(people, (p) => p.group),
);
console.log(
  "arrival coach slots:",
  count(people, (p) => p.coach.arrival.slot ?? "none"),
);
console.log(
  "departure coach slots:",
  count(people, (p) => p.coach.departure.slot ?? "none"),
);
console.log(
  "arrival coaches:",
  arrivalVehicles.map((v) => `${v.vehicle} ${v.time} (${v.people})`).join(", "),
);
console.log(
  "departure coaches:",
  departureVehicles.map((v) => `${v.vehicle} ${v.time} (${v.people})`).join(", "),
);
console.log(
  "no arrival coach because:",
  count(
    people.filter((p) => !p.coach.arrival.slot),
    (p) => p.coach.arrival.why,
  ),
);
console.log(
  "no departure coach because:",
  count(
    people.filter((p) => !p.coach.departure.slot),
    (p) => p.coach.departure.why,
  ),
);
console.log(
  "rooms:",
  rooms.length,
  count(rooms, (r) => r.type),
  count(rooms, (r) => r.residence),
);
