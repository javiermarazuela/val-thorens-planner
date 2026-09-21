import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "./status-badge";
import type { GuideStatus } from "@/lib/trip";

export function GuideCard({ slug, title, status }: { slug: string; title: string; status: GuideStatus }) {
  return (
    <Link to="/guide/$slug" params={{ slug }} className="group flex min-h-36 flex-col justify-between border-t border-border bg-card/40 p-5 transition-colors hover:bg-card">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={status} />
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <h3 className="mt-8 text-xl uppercase leading-tight">{title}</h3>
    </Link>
  );
}