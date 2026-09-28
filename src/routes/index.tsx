import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  MapPin,
  MessageCircle,
  Minus,
  Mountain,
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
  faqSection,
  faqs,
  goingOut,
  guide,
  hero,
  keyDates,
  mapSection,
  mountain,
  offSnow,
  pricing,
  resortFacts,
  resortIntro,
  site,
  stay,
  transfers,
  trip,
  week,
  weekSection,
} from "@/lib/trip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: site.title },
      {
        name: "description",
        content:
          "179 of us in Val Thorens from 9–16 January 2027. See the week, accommodation, price and essential trip guide.",
      },
      { property: "og:title", content: site.homeOgTitle },
      { property: "og:description", content: "One week, 179 people, and 600km of linked piste." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const topFaqs = faqs.filter((faq) => faq.featured);

  return (
    <div id="top">
      <section className="relative min-h-[78svh] overflow-hidden bg-foreground">
        <img
          src={heroImage}
          alt={hero.imageAlt}
          width={1200}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-foreground/20" />
        <div className="relative mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-5 pb-12 pt-20 text-background sm:pb-16">
          <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
            <span className="rounded-full bg-background px-3 py-2 text-foreground">
              {trip.dates}
            </span>
            <span className="rounded-full bg-accent px-3 py-2 text-accent-foreground">
              {trip.people} {hero.peopleSuffix}
            </span>
          </div>
          <h1 className="mt-6 text-5xl uppercase leading-[0.92] sm:text-8xl lg:text-9xl">
            {hero.titleTop}
            <br />
            {hero.titleBottom}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-background/90">{hero.tagline}</p>
        </div>
      </section>

      <section id="price" className="scroll-mt-20 border-b border-border bg-card py-8 sm:py-10">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase text-primary">
                  {pricing.label} · {pricing.unit}
                </p>
                <StatusBadge status={pricing.status} />
              </div>
              <p className="mt-1 font-display text-4xl sm:text-5xl">{pricing.amount}</p>
              <p className="mt-2 text-sm font-semibold">{pricing.nonMemberNote}</p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <a href={pricing.signupUrl} target="_blank" rel="noreferrer">
                {pricing.signupLabel} <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 border-t border-border pt-6 sm:gap-x-10">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-primary">
                <Check className="size-4" aria-hidden="true" /> {pricing.includesTitle}
              </p>
              <ul className="mt-3 space-y-2.5 text-sm leading-snug">
                {pricing.includes.map((item) => (
                  <li key={item} className="font-semibold">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-muted-foreground">
                <Minus className="size-4" aria-hidden="true" /> {pricing.excludesTitle}
              </p>
              <ul className="mt-3 space-y-2.5 text-sm leading-snug">
                {pricing.excludes.map((item) => (
                  <li key={item.label}>
                    <span className="font-semibold">{item.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.price ? `${item.price} · ` : ""}
                      {item.detail}
                    </span>
                    {item.status && <StatusBadge status={item.status} className="mt-1" />}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{pricing.note}</p>

          <div className="mt-6 rounded-lg border border-border bg-background p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              <p className="text-xs font-extrabold uppercase text-primary">{keyDates.title}</p>
              <StatusBadge status={keyDates.status} />
            </div>
            <ol className="mt-3 grid gap-3 sm:grid-cols-3 sm:gap-5">
              {keyDates.items.map((d) => (
                <li key={d.date} className="text-sm leading-snug">
                  <span className="block font-display text-lg">{d.date}</span>
                  <span className="text-muted-foreground">{d.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:gap-10 md:grid-cols-2 md:items-center xl:max-w-6xl">
          <figure className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
            <img
              src={offSlopeImage}
              alt={resortIntro.imageAlt}
              width={1600}
              height={1104}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </figure>
          <div>
            <p className="text-xs font-bold uppercase text-primary">{resortIntro.eyebrow}</p>
            <h2 className="mt-3 text-3xl uppercase leading-tight sm:text-4xl">
              {resortIntro.heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{resortIntro.body}</p>
            <div className="mt-7 grid grid-cols-2 gap-5">
              {resortFacts.slice(0, 2).map((fact) => (
                <div key={fact.label}>
                  <p className="font-display text-2xl text-primary">{fact.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                    {fact.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="stay"
        className="scroll-mt-20 border-y border-border bg-card py-10 sm:py-16 lg:py-24"
      >
        <div className="mx-auto grid max-w-5xl gap-8 px-5 sm:gap-10 md:grid-cols-2 md:items-center xl:max-w-6xl">
          <div className="md:order-2">
            <figure className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
              <img
                src={stayImage}
                alt={stay.imageAlt}
                width={1600}
                height={1104}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold uppercase text-primary">{stay.eyebrow}</p>
              <StatusBadge status={stay.status} />
            </div>
            <h2 className="mt-3 text-3xl uppercase leading-tight sm:text-4xl">{stay.heading}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{stay.intro}</p>
            <p className="mt-5 border-l-4 border-accent pl-4 text-sm leading-relaxed">
              {stay.roomsNote}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <a href={stay.mapUrl} target="_blank" rel="noreferrer">
                <MapPin className="size-4" aria-hidden="true" /> {stay.mapLabel}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="map" className="scroll-mt-20 py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 xl:max-w-6xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{mapSection.eyebrow}</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{mapSection.heading}</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {mapSection.intro}
            </p>
          </div>
          <div className="mt-8">
            <ResortMap />
          </div>
        </div>
      </section>

      <section
        id="week"
        className="scroll-mt-20 border-y border-border bg-card py-10 sm:py-16 lg:py-24"
      >
        <div className="mx-auto max-w-5xl px-5 xl:max-w-6xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{weekSection.eyebrow}</p>
              <h2 className="mt-3 text-3xl uppercase sm:text-4xl">{weekSection.heading}</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {weekSection.intro}
            </p>
          </div>
          <ol className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-border lg:grid-cols-4">
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
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {transfers.body}
            </p>
          </div>

          <details id="guide" className="group scroll-mt-20 mt-8 border-y border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-base font-bold text-primary">
              <span>{guide.summaryLabel}</span>
              <ChevronDown
                className="size-5 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="grid gap-8 border-t border-border py-8 sm:gap-10 lg:grid-cols-2 xl:grid-cols-3">
              <div>
                <h3 className="flex items-center gap-2 text-xl uppercase">
                  <Mountain className="size-5 text-primary" aria-hidden="true" /> {mountain.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {mountain.intro}
                </p>
                <p className="mt-3 border-l-4 border-accent pl-4 text-sm leading-relaxed">
                  {mountain.note}
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-xl uppercase">
                  <Users className="size-5 text-primary" aria-hidden="true" /> {offSnow.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {offSnow.intro}
                </p>
                <p className="mt-3 text-sm font-semibold">{offSnow.forthcomingNote}</p>
              </div>
              <div>
                <h3 className="text-xl uppercase">{goingOut.title}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {goingOut.groups.map((group) => (
                    <li key={group.title}>
                      <span className="font-semibold text-foreground">{group.title}</span> —{" "}
                      {goingOut.status === "soon" ? goingOut.placeholder : group.body}
                    </li>
                  ))}
                </ul>
              </div>
              <details className="lg:col-span-2 xl:col-span-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-primary">
                  <Snowflake className="size-4" aria-hidden="true" /> {guide.packingLabel}
                </summary>
                <div className="mt-5">
                  <PackingList />
                </div>
              </details>
            </div>
          </details>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-8 sm:py-10 xl:max-w-6xl">
        <p className="text-xs font-bold uppercase text-muted-foreground">{mountain.linksTitle}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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

      <section id="contact" className="scroll-mt-20 border-t border-border bg-card py-10 sm:py-14">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 md:grid-cols-[1fr_0.8fr] xl:max-w-6xl">
          <div>
            <p className="text-xs font-bold uppercase text-primary">{faqSection.eyebrow}</p>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {topFaqs.map((faq) => (
                <details key={faq.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    {faq.q}
                    <span className="text-xl text-primary transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                  {faq.link && (
                    <a
                      href={faq.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary"
                    >
                      {faq.link.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </details>
              ))}
            </div>
          </div>
          <div className="md:border-l md:border-border md:pl-10">
            <MessageCircle className="size-6 text-primary" aria-hidden="true" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl uppercase">{contacts.title}</h2>
              <StatusBadge status={contacts.status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{contacts.body}</p>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between xl:max-w-6xl">
        <p>
          {trip.destination} · {trip.dates}
        </p>
        <p>
          {trip.people} people · {trip.region}
        </p>
      </footer>
    </div>
  );
}
