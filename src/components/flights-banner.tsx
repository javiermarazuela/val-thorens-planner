import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/use-session";

// Along the bottom of the welcome photo, for someone who is signed in but has
// not said how they are getting here. Clicking it opens the flights pop-up.
// Rendered only after mount: the session lives in the browser.
export function FlightsBanner({ onVisible }: { onVisible?: (visible: boolean) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Banner onVisible={onVisible} /> : null;
}

function Banner({ onVisible }: { onVisible: ((visible: boolean) => void) | undefined }) {
  const { supabase, session } = useSession();
  const [needed, setNeeded] = useState(false);

  const check = useCallback(() => {
    if (!supabase || !session) {
      setNeeded(false);
      return;
    }
    supabase
      .from("flights")
      .select("arr_flight,arr_mode")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return; // say nothing rather than nag on a failed read
        // Empty: nothing saved, or no arrival flight and not "another way".
        setNeeded(!data || (!data.arr_flight && data.arr_mode !== "other"));
      });
  }, [supabase, session]);

  useEffect(() => {
    check();
    window.addEventListener("flights-saved", check);
    return () => window.removeEventListener("flights-saved", check);
  }, [check]);

  useEffect(() => {
    onVisible?.(needed);
  }, [needed, onVisible]);

  return needed ? <FlightsBannerButton /> : null;
}

export function FlightsBannerButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-flights"))}
      className="absolute inset-x-0 bottom-0 z-10 flex min-h-10 w-full items-center justify-center bg-flame/90 px-4 py-2 text-center text-sm font-bold text-ink backdrop-blur-sm transition-colors hover:bg-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
    >
      Please tell us how you're getting there
    </button>
  );
}
