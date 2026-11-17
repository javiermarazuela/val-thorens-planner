import { VenetianMask } from "lucide-react";

// A day's dress-up theme as a mustard pill, matching the mustard band on
// theme days in The week.
export function ThemeTag({ theme }: { theme: string }) {
  return (
    <p className="inline-flex items-center gap-1.5 rounded-full bg-mustard px-3 py-1 text-sm font-bold text-ink">
      <VenetianMask className="size-[1.1rem] shrink-0" aria-hidden="true" />
      {theme} theme
    </p>
  );
}
