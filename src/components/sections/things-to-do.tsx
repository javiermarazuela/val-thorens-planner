import { useState } from "react";
import { Beer, MapPin, Music, Snowflake, Utensils, type LucideIcon } from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { googleMapsUrl, mapPoints, thingsToDo, type MapKind } from "@/lib/trip";

const KIND_STYLE: Record<MapKind, { label: string; Icon: LucideIcon; band: string }> = {
  stay: { label: "Stay", Icon: MapPin, band: "bg-teal text-paper" },
  lift: { label: "Lift", Icon: MapPin, band: "bg-teal text-paper" },
  restaurant: { label: "Eat", Icon: Utensils, band: "bg-mustard text-ink" },
  apres: { label: "Après", Icon: Beer, band: "bg-signal text-paper" },
  bar: { label: "Bar", Icon: Beer, band: "bg-ink text-paper" },
  club: { label: "Club", Icon: Music, band: "bg-grade-blue text-paper" },
};

const venueKinds: MapKind[] = ["restaurant", "apres", "bar", "club"];

export function ThingsToDo({ n, tone }: SectionProps) {
  const [filter, setFilter] = useState("all");
  const active = thingsToDo.filters.find((f) => f.id === filter);
  const venues = mapPoints.filter(
    (p) =>
      venueKinds.includes(p.kind) && (filter === "all" || (active?.kinds ?? []).includes(p.kind)),
  );
  const showOffSkis = filter === "all" || filter === "snow";

  return (
    <GuideSection id="todo" n={n} tone={tone} title={thingsToDo.title} intro={thingsToDo.intro}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status="soon" />
        <span className="text-sm text-muted-foreground">{thingsToDo.note}</span>
      </div>

      <div role="group" aria-label="Filter" className="mb-6 flex flex-wrap gap-2">
        {thingsToDo.filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={f.id === filter}
            onClick={() => setFilter(f.id)}
            className={`h-11 rounded-full border-[1.5px] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${f.id === filter ? "border-ink bg-ink text-paper" : "border-border bg-card text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((p) => {
          const { label, Icon, band } = KIND_STYLE[p.kind];
          return (
            <li key={p.name} className="flex flex-col overflow-hidden rounded-2xl bg-card">
              <div className={`flex items-center justify-between px-4 py-3 ${band}`}>
                <span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-sans text-lg font-bold normal-case leading-snug">{p.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.note}
                </p>
                <a
                  href={googleMapsUrl(p.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4 hover:no-underline"
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  Open in Google Maps
                </a>
              </div>
            </li>
          );
        })}
        {showOffSkis && (
          <li className="flex flex-col overflow-hidden rounded-2xl bg-card">
            <div className="flex items-center justify-between bg-teal px-4 py-3 text-paper">
              <span className="text-xs font-bold uppercase tracking-[0.14em]">Off the skis</span>
              <Snowflake className="size-5" aria-hidden="true" />
            </div>
            <div className="p-4">
              <h3 className="font-sans text-lg font-bold normal-case leading-snug">
                {thingsToDo.offSkis.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {thingsToDo.offSkis.body}
              </p>
              <p className="mt-3 text-sm font-semibold">{thingsToDo.offSkis.note}</p>
            </div>
          </li>
        )}
      </ul>
    </GuideSection>
  );
}
