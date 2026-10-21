// Test site only: adds an invented year (first / second) and gender (f / m) to
// every traveller in src/test-data/people.json. Seeded, so rerunning gives the
// same result. Roughly 55% first years and 45% women.
import fs from "node:fs";

const file = "src/test-data/people.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

let s = 4242;
const rand = () => {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

for (const p of data.people) {
  p.year = rand() < 0.55 ? "first" : "second";
  p.gender = rand() < 0.45 ? "f" : "m";
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
const count = (f) => data.people.reduce((m, p) => ((m[f(p)] = (m[f(p)] || 0) + 1), m), {});
console.log(count((p) => `${p.year}/${p.gender}`));
