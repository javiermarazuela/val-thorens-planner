// Quick check of Julian's free tier: `bun scripts/chat-check.ts`.
// Asks a list of questions as a signed-out visitor and as a made-up member, and
// prints what comes back, so wording and matching can be eyeballed.
import { answer, makeBrain } from "../src/lib/chat/reply.ts";
import { guideRows, starterRows } from "../src/lib/chat/builtin.ts";
import type { ChatProfile } from "../src/lib/chat/types.ts";

const all = [...guideRows(), ...starterRows].filter((r) => r.status !== "hidden");
const brains = {
  out: makeBrain(all.filter((r) => r.visibility === "everyone")),
  in: makeBrain(all),
};

const profile: ChatProfile = {
  name: "Test Person",
  email: "test@gsb.columbia.test",
  room: {
    residence: "Résidence Village Montana",
    room: "203",
    type: "Double",
    roommates: ["Mei Williams"],
  },
  arrival: {
    how: "geneva",
    date: "2027-01-09",
    time: "07:25",
    flight: "UA956",
    route: "EWR → GVA",
    note: null,
    coachName: "Coach A1",
    coachWhen: "Sat 9 Jan, 08:30",
    pickup: "Geneva airport arrivals (test data)",
    coachWhy: null,
    wantsCoach: "yes",
  },
  departure: {
    how: "geneva",
    date: "2027-01-16",
    time: "13:35",
    flight: "BA731",
    route: "GVA → LHR → JFK",
    note: null,
    coachName: "Coach D2",
    coachWhen: "Sat 16 Jan, 07:30",
    pickup: "Outside the residence (test data)",
    coachWhy: null,
    wantsCoach: "yes",
  },
};

const questions = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "hi",
      "Where is my room?",
      "When will the next coach come?",
      "What time is my shuttle?",
      "What are the plans for tonight?",
      "Do I need to bring cash?",
      "next event",
      "what can I do today, I'm feeling a spa",
      "i want something thrilling",
      "where should I eat",
      "is there wifi",
      "what should I pack",
      "can i add a lift pass later",
      "How do I get to Les Menuires?",
      "Whats the last bus at night",
      "will it snow",
      "do i need insurance",
      "what's the capital of france",
      "tell me a joke",
      "my flights",
      "how does the airport coach work",
      "what time is check in",
    ];

const day = (iso: string) => new Date(iso);
const scenarios: Array<[string, Date, boolean]> = [
  ["signed out, before the trip", day("2026-12-01T12:00:00Z"), false],
  ["member, Sat 9 Jan 09:00", day("2027-01-09T08:00:00Z"), true],
  ["member, Tue 12 Jan 19:00", day("2027-01-12T18:00:00Z"), true],
];

for (const [label, now, signedIn] of scenarios) {
  console.log(`\n===== ${label} =====`);
  for (const q of questions) {
    const r = answer(q, signedIn ? brains.in : brains.out, {
      now,
      signedIn,
      profile: signedIn ? profile : null,
      profileLoaded: true,
    });
    console.log(
      `\nQ: ${q}\n[${r.source}] ${r.text}${r.links?.length ? `\n   links: ${r.links.map((l) => l.label).join(" | ")}` : ""}`,
    );
  }
}
