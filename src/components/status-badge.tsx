import type { GuideStatus } from "@/lib/trip";

// Only pending content gets a badge. Confirmed and partly confirmed content
// reads as plain content; its status still lives in trip.ts (rules 6 and 7).
// "Preliminary" marks sample data the committee has not confirmed yet.
const labels: Partial<Record<GuideStatus, string>> = {
  soon: "Coming soon",
  preliminary: "Preliminary",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: GuideStatus;
  className?: string;
}) {
  const label = labels[status];
  if (!label) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
        status === "preliminary"
          ? "border-signal/40 bg-mustard/40 text-ink"
          : "border-primary/25 bg-secondary text-secondary-foreground"
      } ${className}`}
    >
      {label}
    </span>
  );
}
