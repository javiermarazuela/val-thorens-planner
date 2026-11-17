import type { ReactNode } from "react";
import { VenetianMask } from "lucide-react";

import { themeLook, type ThemeIconName } from "@/lib/trip";

const svg = {
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

// Our own drawings, on the same 24px grid as the lucide icons. Both follow
// currentColor, so they turn white or navy with the text on the band.
const icons: Record<ThemeIconName, (className: string) => ReactNode> = {
  // A bob on a face: rounded crown, a swept fringe, sides that curl under at
  // the jaw, and the chin drawn as a line between them.
  wig: (className) => (
    <svg {...svg} className={className}>
      <path
        fill="currentColor"
        d="M12 2.3c-5 0-8.2 3.6-8.2 8.4v4.9c0 1.5 1 2.6 2.3 2.6h2.3V10.4c2.2-.2 4.2-1 5.7-2.4.5 1 1.2 1.8 2.1 2.3V18h2.3c1.3 0 2.3-1.1 2.3-2.6v-4.7c0-4.8-3.2-8.4-8.8-8.4Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        d="M8.4 14.6c0 3 1.6 5.1 3.6 5.1s3.6-2.1 3.6-5.1"
      />
    </svg>
  ),
  // Big ski goggles: one wide lens with a nose dip, a strap stub on each side.
  goggles: (className) => (
    <svg
      {...svg}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M5.2 6.5h13.6a3.2 3.2 0 0 1 3.2 3.2v2.6a3.7 3.7 0 0 1-3.7 3.7h-3a1.8 1.8 0 0 1-1.6-.9l-.8-1.4a1.1 1.1 0 0 0-1.8 0l-.8 1.4a1.8 1.8 0 0 1-1.6.9h-3A3.7 3.7 0 0 1 2 12.3V9.7a3.2 3.2 0 0 1 3.2-3.2Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <path d="M2 9.3H1v3.4h1M22 9.3h1v3.4h-1" />
      <path d="M5.5 9.4c1.3-.5 2.8-.7 4.2-.7" />
    </svg>
  ),
  mask: (className) => <VenetianMask className={className} aria-hidden="true" />,
};

/** The theme's icon (themeLooks in trip.ts), sized by the caller. */
export function ThemeIcon({ theme, className }: { theme: string; className: string }) {
  return <>{icons[themeLook(theme).icon](className)}</>;
}

// A day's dress-up theme as a pill in the theme's colour, matching the band on
// theme days in The week.
export function ThemeTag({ theme }: { theme: string }) {
  const look = themeLook(theme);
  return (
    <p
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${look.text === "light" ? "text-white" : "text-ink"}`}
      style={{ background: look.band }}
    >
      <ThemeIcon theme={theme} className="size-5 shrink-0" />
      {theme} theme
    </p>
  );
}
