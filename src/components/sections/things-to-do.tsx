import { useState } from "react";
import {
  ExternalLink,
  LayoutGrid,
  Mountain,
  MapPin,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import { MapGlyph } from "@/components/map-glyph";
import type { SectionProps } from "@/components/sections/registry";
import {
  activities,
  activityGroups,
  googleMapsUrl,
  mapKinds,
  mapPoints,
  thingsToDo,
  type MapIcon,
  type MapKind,
} from "@/lib/trip";

function mapKind(id: MapKind) {
  const k = mapKinds.find((m) => m.id === id)!;
  return { glyph: k.icon, color: k.color, dark: k.ink !== undefined };
}

// One coloured tile per area. Areas that are also map pins take the pin's
// colour and icon (`mapKinds`), so the tiles and the map match; Thrills, Top
// views and Everything have no pins and keep their own.
type AreaStyle = { color: string; dark?: boolean } & (
  { glyph: MapIcon; Icon?: undefined } | { Icon: LucideIcon; glyph?: undefined }
);
const AREA_STYLE: Record<string, AreaStyle> = {
  all: { Icon: LayoutGrid, color: "#1F3A47" },
  eat: mapKind("restaurant"),
  apres: mapKind("apres"),
  bars: mapKind("bar"),
  late: mapKind("club"),
  thrills: { Icon: Zap, color: "#DB2777" },
  views: { Icon: Mountain, color: "#2A66CC" },
  indoors: mapKind("indoors"),
};

const venueKinds: MapKind[] = ["restaurant", "apres", "bar", "club"];

export function ThingsToDo({ n, tone }: SectionProps) {
  const [filter, setFilter] = useState<string | null>(null);
  const active = thingsToDo.filters.find((f) => f.id === filter);
  const venueCount = (f: { id: string; kinds?: MapKind[] }) =>
    mapPoints.filter(
      (p) => venueKinds.includes(p.kind) && (f.id === "all" || (f.kinds ?? []).includes(p.kind)),
    ).length;
  const countFor = (f: { id: string; kinds?: MapKind[] }) =>
    venueCount(f) + activities.filter((a) => f.id === "all" || f.id === a.group).length;
  const venues = filter
    ? mapPoints.filter(
        (p) =>
          venueKinds.includes(p.kind) &&
          (filter === "all" || (active?.kinds ?? []).includes(p.kind)),
      )
    : [];
  const shownActivities = filter
    ? activities.filter((a) => filter === "all" || filter === a.group)
    : [];

  return (
    <GuideSection id="todo" n={n} tone={tone} title={thingsToDo.title}>
      <div
        role="group"
        aria-label="Areas"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      >
        {thingsToDo.filters.map((f) => {
          const { Icon, glyph, color, dark } = AREA_STYLE[f.id] ?? AREA_STYLE["all"]!;
          const on = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(on ? null : f.id)}
              style={{ backgroundColor: color }}
              className={`flex h-[96px] flex-col items-start justify-between rounded-2xl p-3 text-left sm:aspect-[5/4] sm:h-auto sm:p-4  transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${dark ? "text-[#14232B]" : "text-white"} ${on ? "ring-2 ring-ink ring-offset-2 ring-offset-background" : "hover:brightness-95"}`}
            >
              {glyph ? (
                <MapGlyph icon={glyph} className="size-5 sm:size-7" />
              ) : (
                Icon && <Icon className="size-5 sm:size-7" aria-hidden="true" />
              )}
              <span>
                <span className="block text-sm font-semibold leading-tight sm:text-base">
                  {f.label}
                </span>
                <span className="block text-xs font-medium sm:text-sm">{countFor(f)} places</span>
              </span>
            </button>
          );
        })}
      </div>

      <ul hidden={!filter} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((p) => {
          const kind = mapKinds.find((k) => k.id === p.kind)!;
          return (
            <li key={p.name} className="flex flex-col rounded-xl border border-border bg-card">
              <div className="flex flex-1 flex-col px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <MapGlyph icon={kind.icon} className="size-3.5" />
                  {kind.label}
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
