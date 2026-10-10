import { getSupabase } from "@/lib/supabase";
import { guideRows, starterRows } from "./builtin";
import type { KbRow } from "./types";

// The rows the chatbot can answer from, in order of trust:
//  1. the knowledge sheet, published to Supabase (what the committee edits),
//  2. the guide's own FAQ, so the bot never contradicts the page,
//  3. the starter rows bundled with the app, until the sheet has been published.

/** Rows from Supabase, as far as the person's login lets them read. Null if unreachable. */
export async function loadSheetRows(): Promise<KbRow[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("chat_knowledge")
    .select("id,area,question,phrasings,answer,visibility,status,link,sort")
    .order("sort");
  if (error || !data) return null;
  return data as KbRow[];
}

/**
 * Everything the bot may use for this person. Sheet rows win over built-in
 * ones with the same id. `includeMembersFallback` adds the bundled members-only
 * starter rows too, which is what the test site wants (its people aren't signed
 * in with Google, so the database would hide those rows from them).
 */
export async function loadKnowledge(options: {
  isMember: boolean;
  includeMembersFallback?: boolean;
}): Promise<KbRow[]> {
  const sheet = (await loadSheetRows()) ?? [];
  const byId = new Map<string, KbRow>();
  const visible = (r: KbRow) =>
    r.status !== "hidden" && (r.visibility === "everyone" || options.isMember);

  // Starter rows only fill in when the sheet has nothing for that id.
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
