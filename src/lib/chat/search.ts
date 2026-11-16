import type { KbRow } from "./types.ts";

// Free, in-browser search over the knowledge rows. No AI: it scores how much of
// what was asked appears in a row's question or other wordings, with rare words
// counting for more than common ones, and forgives a typo.

const STOP = new Set(
  `a an the is are am was were do does did i me to of in at for with and or it its can could
   would should will be been this that there here you your we our so please tell hey hi
   julian just get got what whats when where how which who why`.split(/\s+/),
);

// Words that say little about what is being asked, so they count for less.
const WEAK = new Set([
  "time",
  "day",
  "thing",
  "need",
  "want",
  "know",
  "work",
  "go",
  "going",
  "bring",
]);

export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// A very light stem, enough that "rentals" matches "rental" and "booking" "book".
function stem(word: string): string {
  let w = word;
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  else if (w.length > 4 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  // "cancelled" and "cancel", "stopped" and "stop".
  if (w !== word && w.length > 3 && w[w.length - 1] === w[w.length - 2]) w = w.slice(0, -1);
  return w;
}

export function tokens(text: string): string[] {
  return normalise(text)
    .split(" ")
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

// One edit apart (insert, delete or swap), for words long enough to be typos.
function nearly(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true; // one letter different
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2); // swap
  }
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  return long.slice(i + 1) === short.slice(i);
}

type Candidate = { row: KbRow; words: string[] };

export type Index = {
  candidates: Candidate[];
  idf: Map<string, number>;
  maxIdf: number;
};

export function buildIndex(rows: KbRow[]): Index {
  const candidates: Candidate[] = [];
  const df = new Map<string, number>();
  for (const row of rows) {
    const seen = new Set<string>();
    for (const text of [row.question, ...row.phrasings]) {
      const words = tokens(text);
      if (!words.length) continue;
      candidates.push({ row, words });
      words.forEach((w) => seen.add(w));
    }
    seen.forEach((w) => df.set(w, (df.get(w) ?? 0) + 1));
  }
  const n = Math.max(rows.length, 1);
  const idf = new Map<string, number>();
  let maxIdf = 0;
  df.forEach((count, w) => {
    const v = Math.log(1 + n / count);
    idf.set(w, v);
    maxIdf = Math.max(maxIdf, v);
  });
  return { candidates, idf, maxIdf: maxIdf || 1 };
}

export type Match = { row: KbRow; score: number };

/** The closest rows for a question, best first. Empty if nothing is close enough. */
export function search(question: string, index: Index, minScore = 0.5, limit = 3): Match[] {
  const q = tokens(question);
  if (!q.length) return [];
  const weight = (w: string) => (index.idf.get(w) ?? index.maxIdf) * (WEAK.has(w) ? 0.3 : 1); // unknown words are rare
  const qTotal = q.reduce((s, w) => s + weight(w), 0);

  const best = new Map<string, Match>();
  for (const c of index.candidates) {
    let shared = 0;
    let sharedWeight = 0;
    for (const w of c.words) {
      if (q.some((x) => nearly(x, w))) {
        shared++;
        sharedWeight += weight(w);
      }
    }
    if (!shared) continue;
    const cTotal = c.words.reduce((s, w) => s + weight(w), 0);
    const coverQuestion = sharedWeight / qTotal; // how much of what was asked is covered
    const coverRow = sharedWeight / cTotal; // how much of the row was asked about
    const score = 0.65 * coverQuestion + 0.35 * coverRow;
    const old = best.get(c.row.id);
    if (!old || score > old.score) best.set(c.row.id, { row: c.row, score });
  }
  return [...best.values()]
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
