import { getSupabase } from "@/lib/supabase";

// Writes one anonymous line to the chat log (no person is stored), so the
// committee can see what people ask about and where Julian came up empty.
// Fire and forget: a failure here must never get in the way of an answer.
export type LogEntry = {
  env: "live" | "test";
  area: string;
  source: "chip" | "search" | "profile" | "schedule" | "activity" | "ai" | "login" | "none";
  outcome: "answered" | "unknown" | "offtopic" | "login_prompt" | "blocked" | "limit";
  question: string;
};

export function logChat(entry: LogEntry): void {
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase
    .rpc("chat_log_add", {
      p_env: entry.env,
      p_area: entry.area,
      p_source: entry.source,
      p_outcome: entry.outcome,
      p_question: entry.question,
    })
    .then(
      () => undefined,
      () => undefined,
    );
}
