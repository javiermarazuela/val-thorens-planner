// Puts everyone on one of four teams, balanced on year, gender and residence,
// and prints the SQL that fills the member_teams table (migration 0009).
//
//   bun scripts/allocate-teams.ts people.csv > teams.sql
//
// people.csv has a header row with: name, email, year, gender, residence.
// year is first or second, gender is f or m. Paste teams.sql into the Supabase
// SQL editor. Running it again with the same file gives the same teams, and the
// insert replaces earlier rows, so keep the file as it was to keep the teams.
// It also prints a summary of each team to stderr so you can check the balance.
import fs from "node:fs";

import { allocateTeams } from "../src/lib/social/allocate";

const file = process.argv[2];
if (!file) {
  console.error("Usage: bun scripts/allocate-teams.ts people.csv > teams.sql");
  process.exit(1);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const [head, ...rows] = parseCsv(fs.readFileSync(file, "utf8"));
const col = (n: string) => head!.map((h) => h.trim().toLowerCase()).indexOf(n);
const idx = {
  name: col("name"),
  email: col("email"),
  year: col("year"),
  gender: col("gender"),
  res: col("residence"),
};
for (const [k, v] of Object.entries(idx)) {
  if (v < 0) {
    console.error(`Missing column: ${k}`);
    process.exit(1);
  }
}

const people = rows.map((r) => ({
  name: r[idx.name]!.trim(),
  email: r[idx.email]!.trim().toLowerCase(),
  year: r[idx.year]!.trim().toLowerCase(),
  gender: r[idx.gender]!.trim().toLowerCase(),
  residence: r[idx.res]!.trim(),
}));

const teams = allocateTeams(people.map((p) => ({ key: p.email, ...p })));
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

console.log("-- Teams for Euro Ski 27. Paste into the Supabase SQL editor and run.");
console.log("delete from public.member_teams;");
console.log("insert into public.member_teams (email, name, team, year, gender) values");
console.log(
  people
    .map(
      (p) => `  (${q(p.email)}, ${q(p.name)}, ${teams.get(p.email)}, ${q(p.year)}, ${q(p.gender)})`,
    )
    .join(",\n") + ";",
);

for (let t = 1; t <= 4; t++) {
  const mem = people.filter((p) => teams.get(p.email) === t);
  const count = (f: (p: (typeof people)[number]) => string) =>
    JSON.stringify(
      mem.reduce<Record<string, number>>((m, p) => ((m[f(p)] = (m[f(p)] ?? 0) + 1), m), {}),
    );
  console.error(
    `Team ${t}: ${mem.length}  ${count((p) => `${p.year}/${p.gender}`)}  ${count((p) => p.residence)}`,
  );
}
