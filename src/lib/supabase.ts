import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser-only Supabase client. Returns null when the env vars are missing. */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { flowType: "pkce" } });
  return client;
}
