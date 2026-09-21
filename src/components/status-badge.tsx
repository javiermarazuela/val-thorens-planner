import type { GuideStatus } from "@/lib/trip";

const labels: Record<GuideStatus, string> = {
  confirmed: "Confirmed",
  partial: "Partly confirmed",
  soon: "Coming soon",
};

const styles: Record<GuideStatus, string> = {
  confirmed: "bg-primary text-primary-foreground",
  partial: "bg-accent text-accent-foreground",
  soon: "border border-primary/25 bg-secondary text-secondary-foreground",
};

export function StatusBadge({ status, className = "" }: { status: GuideStatus; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
