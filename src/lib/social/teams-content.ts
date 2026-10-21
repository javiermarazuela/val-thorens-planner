import { dayDetails } from "@/lib/trip";

// Team names, colours and challenges. Kept apart from trip.ts for now; the
// challenge wording and points are preliminary until the committee confirms them.

export type TeamInfo = {
  id: 1 | 2 | 3 | 4;
  name: string;
  /** Plural, for "Team Yeti" or "the Marmots". */
  short: string;
  emoji: string;
  /** Strong colour for blocks and bars; white text sits on it at 4.5:1 or better. */
  color: string;
  /** A shape beside the colour, so colour is never the only cue. */
  shape: "circle" | "square" | "diamond" | "triangle";
};

export const teams: TeamInfo[] = [
  { id: 1, name: "Yeti", short: "Yeti", emoji: "❄️", color: "#1d4ed8", shape: "circle" },
  { id: 2, name: "Marmots", short: "Marmots", emoji: "🐹", color: "#b45309", shape: "square" },
  { id: 3, name: "Ibex", short: "Ibex", emoji: "🐐", color: "#047857", shape: "diamond" },
  {
    id: 4,
    name: "Snow Leopards",
    short: "Snow Leopards",
    emoji: "🐆",
    color: "#6d28d9",
    shape: "triangle",
  },
];

export const teamById = (id: number): TeamInfo => teams.find((t) => t.id === id) ?? teams[0]!;

export type Challenge = {
  id: string;
  title: string;
  text: string;
  /** Points an admin gives by default when approving a photo. */
  points: number;
};

export const challengesStatus = "preliminary" as const;

export const challenges: Challenge[] = [
  {
    id: "summit",
    title: "Summit selfie",
    text: "As many of your team as you can find, at the top of Cime Caron, with the view behind you.",
    points: 30,
  },
  {
    id: "team-photo",
    title: "Team photo",
    text: "Your whole team in one shot, in your team's colour.",
    points: 20,
  },
  {
    id: "creature-hunt",
    title: "Snow creature hunt",
    text: "On bar crawl night, find your team's creature hidden along the route and get a photo with it.",
    points: 30,
  },
  {
    id: "apres-outfit",
    title: "Best après-ski outfit",
    text: "Your best après look. The committee picks the winners.",
    points: 20,
  },
  {
    id: "theme-1",
    title: "Theme night 1 outfit",
    text: "Dress for the first club night's theme (announced nearer the time).",
    points: 20,
  },
  {
    id: "theme-2",
    title: "Theme night 2 outfit",
    text: "Dress for the second club night's theme (announced nearer the time).",
    points: 20,
  },
];

export const challengeById = (id: string) => challenges.find((c) => c.id === id);

// Which challenge belongs to which evening, by the event's name in the week
// plan. A name used twice (the two club nights) lists one challenge per night,
// in order.
const eventChallengeIds: Record<string, string[]> = {
  "Bar Crawl": ["creature-hunt"],
  Après: ["apres-outfit"],
  "Club Night": ["theme-1", "theme-2"],
};

/** The challenge for the nth time an event name comes up in the week, if any. */
export function challengeForEvent(what: string, occurrence: number): Challenge | undefined {
  const id = eventChallengeIds[what]?.[occurrence];
  return id ? challengeById(id) : undefined;
}

/** The challenge for the eventIndex-th event on the dayIndex-th day of the week plan. */
export function challengeAt(dayIndex: number, eventIndex: number): Challenge | undefined {
  const what = dayDetails[dayIndex]?.events[eventIndex]?.what;
  if (!what) return undefined;
  let before = 0;
  for (let d = 0; d <= dayIndex; d++) {
    const events = dayDetails[d]?.events ?? [];
    const upTo = d === dayIndex ? eventIndex : events.length;
    for (let e = 0; e < upTo; e++) if (events[e]?.what === what) before++;
  }
  return challengeForEvent(what, before);
}
