import { faqs } from "@/lib/trip";

import starter from "./starter-knowledge.json";
import type { KbRow } from "./types";

// Rows that ship with the app, so the bot has something to say before the
// knowledge sheet has been published, and never contradicts the guide.

export const starterRows = starter as unknown as KbRow[];

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
