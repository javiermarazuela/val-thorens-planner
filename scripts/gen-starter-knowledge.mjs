// Turns the starter Knowledge.csv into src/lib/chat/starter-knowledge.json, the
// rows the chatbot falls back on until the real sheet has been published to
// Supabase. Run: node scripts/gen-starter-knowledge.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const text = readFileSync(
  join(root, "supabase/sheet-sync/templates/Knowledge.csv"),
  "utf8",
).replace(/^\uFEFF/, "");

// Small CSV reader: quoted fields, doubled quotes, commas and newlines inside quotes.
function parse(src) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const [, ...body] = parse(text);
const out = body.map((r, i) => ({
  id: r[0],
  area: r[1],
  question: r[2],
  phrasings: r[3]
    ? r[3]
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
    : [],
  answer: r[4] ?? "",
  visibility: r[5] || "everyone",
  status: r[6] || "tbc",
  link: r[7] || null,
  sort: i + 1,
}));
writeFileSync(
  join(root, "src/lib/chat/starter-knowledge.json"),
  JSON.stringify(out, null, 1) + "\n",
);
console.log(out.length, "rows");
