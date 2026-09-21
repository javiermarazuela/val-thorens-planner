import type { GuideStatus } from "@/lib/trip";

const labels: Record<GuideStatus, string> = {
  confirmed: "Confirmed",
  partial: "Partly confirmed",
  soon: "Coming soon",
};

export function StatusBadge({ status }: { status: GuideStatus }) {
  return (
    <span className={status === "confirmed" ? "inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground" : status === "partial" ? "inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground" : "inline-flex rounded-full border border-primary/30 bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground"}>
      {labels[status]}
    </span>
  );
}