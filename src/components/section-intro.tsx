import type { ReactNode } from "react";

import { StatusBadge } from "@/components/status-badge";
import type { GuideStatus } from "@/lib/trip";

export function SectionIntro({
  eyebrow,
  title,
  lead,
  status,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  status?: GuideStatus;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
      <div>
        <p className="flex items-center gap-3 text-xs font-extrabold uppercase text-primary">
          <span aria-hidden="true" className="h-px w-8 bg-primary" />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl uppercase leading-[1.05] sm:text-5xl">{title}</h2>
        {status && <StatusBadge status={status} className="mt-5" />}
      </div>
      {lead && (
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {lead}
        </p>
      )}
      {children}
    </div>
  );
}
