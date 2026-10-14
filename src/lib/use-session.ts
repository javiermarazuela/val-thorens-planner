import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { getSupabase } from "@/lib/supabase";

/**
 * The signed-in member, shared by /members and the flights card on the guide.
 * `session` is undefined while loading, null when signed out. Browser only.
 */
export function useSession(returnTo = "/members") {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // A rejected sign-up comes back on the URL as error_description.
    const params = new URLSearchParams(
      window.location.search + "&" + window.location.hash.replace("#", ""),
    );
    if (params.get("error_description")) {
      setAuthError("That account isn't on the list. Use your Columbia Google account.");
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(() => {
    void supabase?.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${returnTo}`,
        queryParams: { prompt: "select_account" },
      },
    });
  }, [supabase, returnTo]);

  return { supabase, session, authError, signIn };
}
