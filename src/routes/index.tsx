import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MountainSnow, Users } from "lucide-react";

import tripImage from "@/assets/val-thorens-trip.jpg";
import guideImage from "@/assets/val-thorens-guide.jpg";
import { Button } from "@/components/ui/button";
import { trip } from "@/lib/trip";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Val Thorens 2027 — University Ski Trip" },
    { name: "description", content: "Join 179 university ski club members in Val Thorens from 9–16 January 2027." },
    { property: "og:title", content: "Val Thorens 2027 — University Ski Trip" },
    { property: "og:description", content: "A week at Europe’s highest ski resort, with 600km of linked piste." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});

function Index() {
  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1600px] gap-3 p-3 md:grid-cols-2 md:p-5">
        <article className="group relative min-h-[72svh] overflow-hidden rounded-lg bg-foreground">
          <img src={tripImage} alt="Val Thorens ski resort and pistes beneath the French Alps" width={1200} height={1600} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-foreground/45" />
          <div className="relative flex h-full min-h-[72svh] flex-col justify-between p-6 text-background sm:p-10 lg:p-14">
            <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase">
              <span className="rounded-full bg-background px-3 py-2 text-foreground">{trip.dates}</span>
              <span className="rounded-full bg-accent px-3 py-2 text-accent-foreground">{trip.people} people</span>
            </div>
            <div className="max-w-xl">
              <p className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase"><span className="h-px w-10 bg-background" /> Europe’s highest resort</p>
              <h1 className="text-5xl uppercase leading-[0.92] sm:text-7xl lg:text-8xl">Val<br />Thorens</h1>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-background/85 sm:text-lg">One week at 2,300m, with 600km of linked piste and 179 of us in the heart of Les 3 Vallées.</p>
              <Button asChild variant="frost" className="mt-7"><a href="#trip-details">See the trip <ArrowRight className="size-4" /></a></Button>
            </div>
          </div>
        </article>

        <article className="group relative min-h-[72svh] overflow-hidden rounded-lg bg-foreground">
          <img src={guideImage} alt="Skiers checking a piste map together in Val Thorens" width={1200} height={1600} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-primary/55" />
          <div className="relative flex h-full min-h-[72svh] flex-col justify-between p-6 text-primary-foreground sm:p-10 lg:p-14">
            <p className="self-start rounded-full border border-primary-foreground/50 px-3 py-2 text-xs font-extrabold uppercase">Updated {trip.guideUpdated}</p>
            <div className="max-w-xl">
              <p className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase"><span className="h-px w-10 bg-primary-foreground" /> Your week, sorted</p>
              <h2 className="text-5xl uppercase leading-[0.92] sm:text-7xl lg:text-8xl">The<br />Guide</h2>
              <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-primary-foreground/85 sm:text-lg">One current place for travel, the mountain, the week’s plans, non-skiers and chalet games.</p>
              <Button asChild variant="outline" className="mt-7 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"><Link to="/guide">Open the guide <ArrowRight className="size-4" /></Link></Button>
            </div>
          </div>
        </article>
      </section>

      <section id="trip-details" className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-xs font-extrabold uppercase text-primary">The case for Val Thorens</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <h2 className="max-w-3xl text-4xl uppercase leading-tight sm:text-6xl">High, linked and made for a big week together.</h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">Val Thorens is compact, largely pedestrian and mostly ski-in ski-out. You get 150km locally, connected into the world’s largest linked ski area.</p>
          </div>
          <div className="mt-14 grid border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
            {[[MountainSnow, trip.altitude, "highest resort in Europe"], [MountainSnow, trip.linkedPiste, "linked piste in Les 3 Vallées"], [Users, String(trip.people), "club members"]].map(([Icon, value, label]) => <div key={String(label)} className="py-7 sm:px-7 first:pl-0"><Icon className="size-6 text-primary" /><p className="mt-5 font-display text-4xl">{String(value)}</p><p className="mt-2 text-sm text-muted-foreground">{String(label)}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 md:grid-cols-2">
          <div><p className="text-xs font-extrabold uppercase text-primary">What’s included</p><h2 className="mt-4 text-4xl uppercase">Details are coming together.</h2></div>
          <div className="border-l-4 border-accent bg-card p-6"><p className="font-bold">Coming soon</p><p className="mt-2 text-muted-foreground">Price, payment dates and the confirmed inclusions will appear here as soon as the committee has signed them off.</p></div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div><p className="text-xs font-extrabold uppercase text-primary-foreground/70">Not skiing every day?</p><h2 className="mt-4 text-4xl uppercase sm:text-6xl">You still have a week.</h2></div>
          <div><p className="text-lg leading-relaxed text-primary-foreground/85">There will be daytime plans for anyone off the mountain—by choice, injury, rest day or hangover. It is a programme in its own right, not an afterthought.</p><Button asChild variant="frost" className="mt-7"><Link to="/guide/$slug" params={{ slug: "non-skiers" }}>Non-skier plans <ArrowRight className="size-4" /></Link></Button></div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>{trip.destination} · {trip.dates}</p><p className="flex items-center gap-2"><CalendarDays className="size-4" /> Guide updated {trip.guideUpdated}</p></footer>
    </div>
  );
}
