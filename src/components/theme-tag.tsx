import { VenetianMask } from "lucide-react";

import { themeLook } from "@/lib/trip";

// A day's dress-up theme as a pill in the theme's colour (themeLooks in
// trip.ts), matching the band on theme days in The week.
export function ThemeTag({ theme }: { theme: string }) {
  const look = themeLook(theme);
  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${look.text === "light" ? "text-white" : "text-ink"}`}
      style={{ background: look.band }}
    >
      <VenetianMask className="size-[1.1rem] shrink-0" aria-hidden="true" />
      {theme} theme
    </p>
  );
}
