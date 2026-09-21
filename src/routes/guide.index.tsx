import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarClock, PhoneCall } from "lucide-react";

import { GuideCard } from "@/components/guide-card";
import { Button } from "@/components/ui/button";
import { getGuideOverview } from "@/lib/guide.functions";

export const Route = createFileRoute("/guide/")({
  loader: () => getGuideOverview(),
  head: () => ({ meta: [
    { title: "Trip Guide — Val Thorens 2027" },
    { name: "description", content: "The current attendee guide for the university ski club trip to Val Thorens." },
    { property: "og:title", content: "Trip Guide — Val Thorens 2027" },
    { property: "og:description", content: "Travel, schedules, mountain information, non-skier plans and more for Val Thorens 2027." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: GuideHome,
});

const groupCopy = {
  Plan: "Before you leave and throughout the week",
  Mountain: "The resort, accommodation and skiing",
  "Off-slope": "Food, activities and days away from skiing",
  Club: "The shared parts of our week",
};

function GuideHome() {
  const { updated, areas } = Route.useLoaderData();
  const groups = ["Plan", "Mountain", "Off-slope", "Club"] as const;

  return (
    <div>
      <section className="border-b border-border bg-primary py-14 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase text-primary-foreground/75"><span>Val Thorens 2027</span><span aria-hidden="true">/</span><span>Attendee guide</span></div>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><h1 className="text-5xl uppercase leading-none sm:text-7xl">Know before<br />you go.</h1><p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">The one current place for every confirmed detail—and a clear view of what is still being decided.</p></div>
            <div className="border-l-4 border-accent bg-primary-foreground/10 p-5"><p className="flex items-center gap-2 text-xs font-extrabold uppercase"><CalendarClock className="size-4" /> Last updated</p><p className="mt-2 text-lg font-bold">{updated}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="space-y-16">
          {groups.map((group) => (
            <section key={group}>
              <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-3xl uppercase">{group}</h2><p className="text-sm text-muted-foreground">{groupCopy[group]}</p></div>
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{areas.filter((area) => area.group === group).map((area) => <GuideCard key={area.slug} {...area} />)}</div>
            </section>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="flex items-center gap-2 font-bold"><PhoneCall className="size-5 text-primary" /> Urgent help & organiser contacts</p><p className="mt-2 text-sm text-muted-foreground">Contact details will be published here before departure.</p></div><Button asChild variant="outline"><Link to="/guide/$slug" params={{ slug: "faqs" }}>Open FAQs <ArrowRight className="size-4" /></Link></Button></div>
      </section>
    </div>
  );
}