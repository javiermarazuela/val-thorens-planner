import { useState } from "react";
import {
  Beer,
  ExternalLink,
  MapPin,
  Music,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import {
  activities,
  activityGroups,
  googleMapsUrl,
  mapPoints,
  thingsToDo,
  type MapKind,
} from "@/lib/trip";

const KIND_STYLE: Record<MapKind, { label: string; Icon: LucideIcon }> = {
  stay: { label: "Stay", Icon: MapPin },
  lift: { label: "Lift", Icon: MapPin },
  restaurant: { label: "Eat", Icon: Utensils },
  apres: { label: "Après", Icon: Beer },
  bar: { label: "Bar", Icon: Beer },
  club: { label: "Club", Icon: Music },
  indoors: { label: "Indoors", Icon: MapPin },
};

const venueKinds: MapKind[] = ["restaurant", "apres", "bar", "club"];

export function ThingsToDo({ n, tone }: SectionProps) {
  const [filter, setFilter] = useState("all");
  const active = thingsToDo.filters.find((f) => f.id === filter);
  const venues = mapPoints.filter(
    (p) =>
      venueKinds.includes(p.kind) && (filter === "all" || (active?.kinds ?? []).includes(p.kind)),
  );
  const shownActivities = activities.filter((a) => filter === "all" || filter === a.group);

  return (
    <GuideSection id="todo" n={n} tone={tone} title={thingsToDo.title}>
      <div role="group" aria-label="Filter" className="mb-4 flex flex-wrap gap-2">
        {thingsToDo.filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={f.id === filter}
            onClick={() => setFilter(f.id)}
            className={`h-9 rounded-full border-[1.5px] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${f.id === filter ? "border-ink bg-ink text-paper" : "border-border bg-card text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((p) => {
          const { label, Icon } = KIND_STYLE[p.kind];
          return (
            <li key={p.name} className="flex flex-col rounded-xl border border-border bg-card">
              <div className="flex flex-1 flex-col px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </span>
                <h3 className="mt-1 font-sans text-base font-semibold normal-case leading-snug">
                  {p.name}
                </h3>
                <a
                  href={googleMapsUrl(p.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  Open in Google Maps
                </a>
              </div>
            </li>
          );
        })}
        {shownActivities.map((a) => (
          <li key={a.name} className="flex flex-col rounded-xl border border-border bg-card">
            <div className="flex flex-1 flex-col px-4 py-3">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {activityGroups.find((g) => g.id === a.group)?.label}
              </span>
              <h3 className="mt-1 font-sans text-base font-semibold normal-case leading-snug">
                {a.name}
              </h3>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Open website
              </a>
            </div>
          </li>
        ))}
      </ul>
      <a
        href={thingsToDo.moreUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
      >
        {thingsToDo.moreLabel}
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </a>
    </GuideSection>
  );
}
