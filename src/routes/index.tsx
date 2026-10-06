import { createFileRoute } from "@tanstack/react-router";

import { GuideHeader, GuideRail } from "@/components/guide-nav";
import { sectionComponents } from "@/components/sections/registry";
import { pickOrder, sectionsFor, stopsFor, type GuideOrder } from "@/lib/guide-order";
import { site, trip, type SectionId } from "@/lib/trip";
import { useScrollSpy } from "@/lib/use-scroll-spy";

const available = new Set(Object.keys(sectionComponents) as SectionId[]);

export const Route = createFileRoute("/")({
  // ?order=trip or ?order=journey shows either order before the trip starts.
  validateSearch: (search: Record<string, unknown>): { order?: GuideOrder } => {
    const order = search["order"];
    return order === "trip" || order === "journey" ? { order } : {};
  },
  head: () => ({
    meta: [
      { title: site.title },
      { name: "description", content: site.description },
      { property: "og:title", content: site.homeOgTitle },
      { property: "og:description", content: site.ogDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { order: override } = Route.useSearch();
  const ids = sectionsFor(pickOrder(new Date(), override), available);
  const stops = stopsFor(ids);
  const { index, progress } = useScrollSpy(ids);

  return (
    <div id="top" className="min-[1100px]:pl-[var(--rail-w)]">
      <GuideRail stops={stops} current={index} />
      <GuideHeader stops={stops} current={index} progress={progress} />

      {stops.map((stop) => {
        const Section = sectionComponents[stop.id];
        if (!Section) return null;
        return <Section key={stop.id} n={stop.n} tone="paper" />;
      })}

      <footer className="bg-ink text-paper">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-10 text-sm sm:flex-row sm:items-end sm:justify-between xl:max-w-6xl">
          <p className="font-display text-3xl uppercase leading-none sm:text-5xl">{site.name}</p>
          <p className="text-paper/80">
            {trip.destination} · {trip.dates} · {trip.people} people
          </p>
        </div>
      </footer>
    </div>
  );
}
