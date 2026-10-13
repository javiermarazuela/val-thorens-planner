import { faqs } from "@/lib/trip";

import starter from "./starter-knowledge.json";
import type { KbRow } from "./types";

// Rows that ship with the app, so the bot has something to say before the
// knowledge sheet has been published, and never contradicts the guide.

// Test site only: src/test-data/knowledge-fill.json holds invented answers for
// the starter rows the committee has not filled in yet, so a demo has something
// to say. A glob, so the real site builds without it; under bun (the check
// scripts) the glob does not exist, hence the try.
let testFill: Record<string, string> = {};
try {
  const mods = import.meta.glob<Record<string, string>>("../../test-data/knowledge-fill.json", {
    eager: true,
    import: "default",
  });
  testFill = Object.values(mods)[0] ?? {};
} catch {
  // not running under Vite
}

export const starterRows = (starter as unknown as KbRow[]).map((r) => {
  const fill = testFill[r.id];
  return !r.answer.trim() && fill ? { ...r, answer: fill } : r;
});

// Other ways people ask the guide's own FAQs, so the free search finds them.
const alsoAsked: Record<string, string[]> = {
  "Which flights should I book?": [
    "which flight",
    "what flight should I take",
    "flights to geneva",
  ],
  "What if I don’t ski?": ["not skiing", "non skier", "I dont want to ski", "what if I dont ski"],
  "Do I need to have skied before?": [
    "beginner",
    "never skied",
    "first time skiing",
    "can I ski if I have never skied",
    "novice",
  ],
  "Cash or card?": [
    "do I need to bring cash",
    "do I need cash",
    "bring cash",
    "euros",
    "atm",
    "do they take cards",
    "money",
  ],
  "Can I bring my own skis?": ["own equipment", "own boots", "bring my own gear"],
  "What time is the last lift?": ["last lift", "when do the lifts close", "lifts close"],
  "What if I get injured?": ["hurt", "injury", "accident", "sick", "doctor", "hospital"],
  "How many days does the lift pass cover?": ["lift pass days", "ski pass", "how long is the pass"],
  "How much luggage can I bring?": [
    "suitcase",
    "bags",
    "baggage",
    "luggage allowance",
    "how many bags",
  ],
};

/** The guide FAQ as rows, minus the archived sales-era answers. */
export function guideRows(): KbRow[] {
  return faqs
    .filter((f) => !f.archived)
    .map((f, i) => ({
      id: `guide-faq-${i + 1}`,
      area: "Guide FAQ",
      question: f.q,
      phrasings: alsoAsked[f.q] ?? [],
      answer: f.a,
      visibility: "everyone" as const,
      status:
        f.status === "confirmed" || f.status === "partial"
          ? ("confirmed" as const)
          : ("tbc" as const),
      link: "/#faqs",
      sort: 1000 + i,
    }));
}

/**
 * Everything the bot may use for one person. Sheet rows win over built-in ones
 * with the same id. `includeMembersFallback` adds the bundled members-only
 * starter rows too, which is what the test site wants (its people aren't signed
 * in with Google, so the database would hide those rows from them).
 */
export function mergeKnowledge(
  sheet: KbRow[],
  options: { isMember: boolean; includeMembersFallback?: boolean },
): KbRow[] {
  const byId = new Map<string, KbRow>();
  const visible = (r: KbRow) =>
    r.status !== "hidden" && (r.visibility === "everyone" || options.isMember);

  // Built-in rows only fill in when the sheet has nothing for that id.
  for (const r of [...guideRows(), ...starterRows]) {
    if (!visible(r)) continue;
    if (r.visibility === "members" && !options.includeMembersFallback && sheet.length) continue;
    byId.set(r.id, r);
  }
  for (const r of sheet) {
    if (visible(r)) byId.set(r.id, r);
    else byId.delete(r.id); // hidden in the sheet means hidden, even if a starter row exists
  }
  return [...byId.values()];
}
