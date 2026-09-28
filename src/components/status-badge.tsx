import type { GuideStatus } from "@/lib/trip";

// Only pending content gets a badge. Confirmed and partly confirmed content
// reads as plain content; its status still lives in trip.ts (rules 6 and 7).
export function StatusBadge({
  status,
  className = "",
}: {
  status: GuideStatus;
  className?: string;
}) {
  if (status !== "soon") return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-secondary px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-secondary-foreground ${className}`}
    >
      Coming soon
    </span>
  );
}
