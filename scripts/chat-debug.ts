// Shows the closest rows and scores for a question: `bun scripts/chat-debug.ts "do I need cash"`.
import { guideRows, starterRows } from "../src/lib/chat/builtin.ts";
import { buildIndex, search } from "../src/lib/chat/search.ts";

const index = buildIndex([...guideRows(), ...starterRows]);
for (const q of process.argv.slice(2)) {
  console.log(`\nQ: ${q}`);
  for (const m of search(q, index, 0.2, 5)) console.log(`  ${m.score.toFixed(2)}  ${m.row.id}  ${m.row.answer ? "" : "(blank)"}`);
}
