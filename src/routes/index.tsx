import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  ExternalLink,
  MapPin,
  Mountain,
  PhoneCall,
  Plane,
  Snowflake,
  Users,
} from "lucide-react";

import heroImage from "@/assets/val-thorens-trip.jpg";
import stayImage from "@/assets/val-thorens-stay.jpg";
import offSlopeImage from "@/assets/val-thorens-offslope.jpg";
import { PackingList } from "@/components/packing-list";
import { ResortMap } from "@/components/resort-map";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  contacts,
  faqs,
  goingOut,
  mountain,
  offSnow,
  pricing,
  resortFacts,
  stay,
  teamGames,
  transfers,
  trip,
  week,
} from "@/lib/trip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Val Thorens 2027 — Ski Club Trip, 9–16 January" },
      {
        name: "description",
        content: "179 of us in Val Thorens from 9–16 January 2027. See the week, accommodation, price and essential trip guide.",
      },
      { property: "og:title", content: "Val Thorens 2027 — Ski Club Trip" },
      { property: "og:description", content: "One week, 179 people, and 600km of linked piste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const topFaqs = [faqs[0], faqs[1], faqs[3]].filter((faq) => faq !== undefined);

  return (
    <div id="top">
      <section className="relative min-h-[78svh] overflow-hidden bg-foreground">
        <img
          src={heroImage}
          alt="Val Thorens ski resort beneath the French Alps"
          width={1200}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-foreground/20" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-5 pb-12 pt-20 text-background sm:pb-16">
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
            <span className="rounded-full bg-background px-3 py-2 text-foreground">{trip.dates}</span>
            <span className="rounded-full bg-accent px-3 py-2 text-accent-foreground">{trip.people} of us</span>
          </div>
          <h1 className="mt-6 text-5xl uppercase leading-[0.92] sm:text-8xl lg:text-9xl">Val<br />Thorens</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-background/90">
            A week at 2,300m in the world’s largest linked ski area.
          </p>
        </div>
      </section>

      <section id="price" className="scroll-mt-20 border-b border-border bg-card py-8 sm:py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-primary">Approximate price per person</p>
            <p className="mt-1 font-display text-4xl sm:text-5xl">~€2,000</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">Final inclusions and payment dates are still being confirmed.</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <a href="#contact">Book your place <ArrowRight className="size-4" aria-hidden="true" /></a>
          </Button>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-2 md:items-center">
          <figure className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
            <img src={offSlopeImage} alt="Friends together on a snowy terrace" width={1600} height={1104} loading="lazy" className="h-full w-full object-cover" />
          </figure>
          <div>
            <p className="text-xs font-bold uppercase text-primary">Why Val Thorens</p>
            <h2 className="mt-3 text-3xl uppercase leading-tight sm:text-4xl">High, linked, easy.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Europe’s highest ski resort puts {trip.localPiste} of piste at the door and {trip.linkedPiste} across Les 3 Vallées. The village is compact, mostly pedestrian and built for a group this size.
            </p>
            <div className="mt-7 flex flex-wrap gap-5">
              {resortFacts.slice(0, 2).map((fact) => (
                <div key={fact.label}>
                  <p className="font-display text-2xl text-primary">{fact.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="stay" className="scroll-mt-20 border-y border-border bg-card py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-2 md:items-center">
          <div className="md:order-2">
            <figure className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
              <img src={stayImage} alt="Timber-clad alpine accommodation in Val Thorens" width={1600} height={1104} loading="lazy" className="h-full w-full object-cover" />
            </figure>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase text-primary">Where we stay</p>
              <StatusBadge status={stay.status} />
            </div>
            <h2 className="mt-3 text-3xl uppercase leading-tight sm:text-4xl">Inside the village.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Self-catered apartments, walking distance from the lifts, the bars and each other. Exact buildings and rooming are still to come.
            </p>
            <p className="mt-5 border-l-4 border-accent pl-4 text-sm leading-relaxed">{stay.roomsNote}</p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <a href={stay.mapUrl} target="_blank" rel="noreferrer"><MapPin className="size-4" aria-hidden="true" /> Resort map</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="map" className="scroll-mt-20 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-primary">The resort</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">Map</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Where we sleep, where the lifts are, where lunch, après and the late ones happen.
            </p>
          </div>
          <div className="mt-8">
            <ResortMap />
          </div>
        </div>
      </section>

      <section id="week" className="scroll-mt-20 border-y border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-primary">9—16 January</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">The week</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Two travel days, six full days in between. Theme details will appear as they are agreed.</p>
          </div>
          <ol className="mt-9 grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-4">
            {week.map((day) => (
              <li key={day.date} className="bg-card p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-xl uppercase">{day.day}</p>
                  <p className="text-xs font-bold text-muted-foreground">{day.date}</p>
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug">{day.title}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-lg border border-border bg-background p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Plane className="size-5 text-primary" aria-hidden="true" />
              <p className="font-semibold">{transfers.headline}</p>
              <StatusBadge status={transfers.status} />
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{transfers.body}</p>
          </div>

          <details id="guide" className="group scroll-mt-20 mt-8 border-y border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-base font-bold text-primary">
              <span>See the guide</span>
              <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-10 border-t border-border py-8 lg:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 text-xl uppercase"><Mountain className="size-5 text-primary" aria-hidden="true" /> Mountain</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Beginner slopes start in town, and the whole of Les 3 Vallées connects from the same lifts.</p>
                <p className="mt-3 border-l-4 border-accent pl-4 text-sm leading-relaxed">{mountain.note}</p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-xl uppercase"><Users className="size-5 text-primary" aria-hidden="true" /> Not skiing</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offSnow.intro}</p>
                <p className="mt-3 text-sm font-semibold">Day-by-day activities and meeting points are coming soon.</p>
              </div>
              <div>
                <h3 className="text-xl uppercase">Eating & going out</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {goingOut.groups.map((group) => <li key={group.title}><span className="font-semibold text-foreground">{group.title}</span> — shortlist coming soon.</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xl uppercase">Team games</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{teamGames.body}</p>
              </div>
              <details className="lg:col-span-2">
                <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-primary"><Snowflake className="size-4" aria-hidden="true" /> Open packing list</summary>
                <div className="mt-5"><PackingList /></div>
              </details>
            </div>
          </details>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-bold uppercase text-muted-foreground">Live resort links</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {mountain.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-foreground"
            >
              {link.label}
              <ExternalLink className="size-3.5 text-primary" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 border-t border-border bg-card py-14">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-bold uppercase text-primary">A few answers</p>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {topFaqs.map((faq) => (
                <details key={faq.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {faq.q}<span className="text-xl text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="md:border-l md:border-border md:pl-10">
            <PhoneCall className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-2xl uppercase">Talk to Jonah</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Questions or ready to book? Jonah is your first point of contact.</p>
            <Button asChild className="mt-6"><a href="tel:+12025579599">+1 (202) 557-9599</a></Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>{trip.destination} · {trip.dates}</p>
        <p>{trip.people} people · {trip.region}</p>
      </footer>
    </div>
  );
}

