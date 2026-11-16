import { VenetianMask } from "lucide-react";

// A day's dress-up theme (from `week` in trip.ts). "strip" runs across the top
// of a day card; "pill" sits on its own line above a heading.
export function ThemeTag({ theme, variant }: { theme: string; variant: "strip" | "pill" }) {
  const shape =
    variant === "strip" ? "flex w-full px-4 py-2" : "inline-flex rounded-full px-3 py-1";
  return (
    <p className={`${shape} items-center gap-2 bg-mustard text-ink`}>
      <VenetianMask className="size-[1.1rem] shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium uppercase tracking-wider">Theme</span>
      <span className="text-sm font-bold">{theme}</span>
    </p>
  );
}
