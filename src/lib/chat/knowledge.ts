import { getSupabase } from "@/lib/supabase";
import { mergeKnowledge } from "./builtin";
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

/** Everything the bot may use for this person; see mergeKnowledge for the rules. */
export async function loadKnowledge(options: {
  isMember: boolean;
  includeMembersFallback?: boolean;
}): Promise<KbRow[]> {
  return mergeKnowledge((await loadSheetRows()) ?? [], options);
}
