import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Lock,
  MapPin,
  MessageCircle,
  Mountain,
  PhoneCall,
  Snowflake,
  Trophy,
} from "lucide-react";

import heroImage from "@/assets/val-thorens-trip.jpg";
import guideImage from "@/assets/val-thorens-guide.jpg";
import stayImage from "@/assets/val-thorens-stay.jpg";
import offSlopeImage from "@/assets/val-thorens-offslope.jpg";
import { KnownForthcoming } from "@/components/known-forthcoming";
import { PackingList } from "@/components/packing-list";
import { SectionIntro } from "@/components/section-intro";
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
  resortPoints,
  stay,
  teamGames,
  trip,
  week,
} from "@/lib/trip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Val Thorens 2027 — Ski Club Trip, 9–16 January" },
      {
        name: "description",
        content:
          "179 of us, one week at 2,300m in Val Thorens from 9–16 January 2027. The week, the accommodation, the packing list, the price and every answer in one place.",
      },
      { property: "og:title", content: "Val Thorens 2027 — Ski Club Trip, 9–16 January" },
      {
        property: "og:description",
        content:
          "Europe's highest ski resort, 600km of linked piste, and everything you need to know before January.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div id="top">
      {/* Hero */}
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-foreground">
        <img
          src={heroImage}
          alt="Val Thorens ski resort and pistes beneath the French Alps"
          width={1200}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/55 to-foreground/35" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-end px-5 pb-12 pt-20 text-background sm:pb-16">
          <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase">
            <span className="rounded-full bg-background px-3 py-2 text-foreground">{trip.dates}</span>
            <span className="rounded-full bg-accent px-3 py-2 text-accent-foreground">{trip.people} of us</span>
            <span className="rounded-full border border-background/50 px-3 py-2">{trip.region}</span>
          </div>
          <h1 className="mt-7 text-[3.25rem] uppercase leading-[0.9] sm:text-8xl lg:text-9xl">
            Val
            <br />
            Thorens
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/90">
            Eight days at 2,300m, 600km of linked piste out of the front door, and 179 people you already know within
            walking distance of each other. This page is the whole trip — and it keeps getting fuller until January.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="frost">
              <a href="#price">
                Book your place <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-background text-background hover:bg-background hover:text-foreground"
            >
              <a href="#week">See the week</a>
            </Button>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs font-bold uppercase text-background/70">
            <CalendarDays className="size-4" aria-hidden="true" /> Last updated {trip.updated}
          </p>
        </div>
      </section>

      {/* Resort */}
      <section id="resort" className="scroll-mt-20 border-b border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Why here"
            title={<>High, linked, and built for a group this size.</>}
            lead="Val Thorens is the highest ski resort in Europe and sits inside the largest linked ski area in the world. For a trip of 179 people that matters for one simple reason: nobody has to travel to reach anybody."
          />
          <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {resortFacts.map((fact) => (
              <div key={fact.label} className="bg-card p-6">
                <p className="font-display text-4xl text-primary">{fact.value}</p>
                <p className="mt-3 text-sm font-bold uppercase">{fact.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fact.note}</p>
              </div>
            ))}
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {resortPoints.map((point) => (
              <li key={point} className="flex gap-3 text-base leading-relaxed">
                <Snowflake className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Where we stay */}
      <section id="stay" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Where we stay"
            title="Everyone inside the village."
            status={stay.status}
            lead="Self-catered apartments in Val Thorens itself, walking distance from the lifts and from each other. No valley transfers, no split group, no taxi home."
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <figure className="overflow-hidden rounded-lg">
              <img
                src={stayImage}
                alt="Timber-clad alpine apartment building in Val Thorens lit up at dusk"
                width={1600}
                height={1104}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
            <div className="space-y-6">
              <KnownForthcoming known={stay.known} forthcoming={stay.forthcoming} />
              <div className="rounded-lg border-l-4 border-primary bg-card p-5">
                <p className="text-xs font-extrabold uppercase text-primary">How rooms work</p>
                <p className="mt-2 text-base leading-relaxed">{stay.roomsNote}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href={stay.mapUrl} target="_blank" rel="noreferrer">
                    <MapPin className="size-4" aria-hidden="true" /> Resort map
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  Building addresses, key collection and the rooming list are attendee-only. They will appear here for
                  people who are booked, once the club password is switched on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The week */}
      <section id="week" className="scroll-mt-20 border-y border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="The week"
            title="Saturday to Saturday."
            lead="The shape of the week is set: two travel days and six full days in between. The detail inside each day is still being built, and this calendar fills in as it lands."
          />
          <ol className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {week.map((day) => (
              <li key={day.date} className="flex flex-col bg-card p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-2xl uppercase">{day.day}</p>
                  <p className="text-xs font-bold uppercase text-muted-foreground">{day.date}</p>
                </div>
                <h3 className="mt-4 text-base font-bold uppercase leading-snug">{day.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{day.body}</p>
                <StatusBadge status={day.status} className="mt-5 self-start" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mountain */}
      <section id="mountain" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="The mountain"
            title="150km at the door, 600km beyond it."
            status={mountain.status}
            lead="Whether this is your twentieth season or your first ever morning in ski boots, the same village works for you. Beginner slopes start in town; the long days start from the same lift."
          />
          <div className="mt-12 space-y-6">
            <KnownForthcoming known={mountain.known} forthcoming={mountain.forthcoming} />
            <div className="rounded-lg border-l-4 border-accent bg-secondary/60 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-accent-foreground">
                <Mountain className="size-4" aria-hidden="true" /> Worth knowing
              </p>
              <p className="mt-2 text-base leading-relaxed">{mountain.note}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-4">
              {mountain.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-3 bg-card p-5 text-sm font-bold uppercase transition-colors hover:bg-secondary"
                >
                  {link.label}
                  <ExternalLink className="size-4 shrink-0 text-primary" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Not skiing */}
      <section id="off-snow" className="scroll-mt-20 bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="flex items-center gap-3 text-xs font-extrabold uppercase text-primary-foreground/70">
                <span aria-hidden="true" className="h-px w-8 bg-primary-foreground/70" /> Not skiing
              </p>
              <h2 className="mt-4 text-3xl uppercase leading-[1.05] sm:text-5xl">
                A week that works without a lift pass.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-primary-foreground/85">{offSnow.intro}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-extrabold uppercase text-primary-foreground/70">Already decided</p>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed text-primary-foreground/90">
                    {offSnow.known.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-l-4 border-accent pl-4">
                  <p className="text-xs font-extrabold uppercase text-primary-foreground/70">Still being decided</p>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed text-primary-foreground/90">
                    {offSnow.forthcoming.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <figure className="overflow-hidden rounded-lg">
              <img
                src={offSlopeImage}
                alt="Friends laughing over hot drinks on a snowy terrace in the village"
                width={1600}
                height={1104}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Eating, drinking, going out */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Eating & going out"
            title="Lunch, dinner, après, and the walk home."
            status={goingOut.status}
            lead="We are collecting the shortlist rather than copying a tourist page. It goes up when the recommendations are ours."
          />
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {goingOut.groups.map((group) => (
              <div key={group.title} className="bg-background p-6">
                <h3 className="text-base font-bold uppercase">{group.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 rounded-lg border border-border bg-card p-6 lg:grid-cols-[auto_1fr] lg:items-start sm:p-8">
            <span className="grid size-12 place-items-center rounded-md bg-primary text-primary-foreground">
              <Trophy className="size-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl uppercase">The team games</h3>
                <StatusBadge status={teamGames.status} />
              </div>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{teamGames.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packing */}
      <section id="packing" className="scroll-mt-20 bg-card py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Packing"
            title="Tick it off as you go."
            lead="The list that actually matters at 2,300m in January. Sun cream is not a joke item — the burn comes off the snow as much as the sky."
          />
          <div className="mt-12">
            <PackingList />
          </div>
        </div>
      </section>

      {/* Price */}
      <section id="price" className="scroll-mt-20 border-y border-border py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Price & booking"
            title="What it costs, and how you sign up."
            status={pricing.status}
            lead={pricing.note}
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <KnownForthcoming
              known={pricing.known}
              forthcoming={pricing.forthcoming}
              knownTitle="How payment works"
              forthcomingTitle="Awaiting committee sign-off"
            />
            <div className="rounded-lg bg-foreground p-7 text-background">
              <p className="text-xs font-extrabold uppercase text-background/70">Price per person</p>
              <p className="mt-4 font-display text-5xl">To be confirmed</p>
              <p className="mt-4 text-sm leading-relaxed text-background/80">
                Booking opens as soon as the price is signed off. Until then, nothing to pay and nothing to commit to —
                come back to this page or ask an organiser.
              </p>
              <Button asChild variant="frost" className="mt-7 w-full bg-background text-foreground hover:bg-background/90">
                <a href="#answers">
                  <MessageCircle className="size-4" aria-hidden="true" /> Ask an organiser
                </a>
              </Button>
              <p className="mt-4 text-center text-xs uppercase text-background/60">Last updated {trip.updated}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Answers */}
      <section id="answers" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionIntro
            eyebrow="Answers"
            title="The questions we get asked most."
            lead="If it is asked in the group chat more than twice, it ends up here instead."
          />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="text-base font-bold sm:text-lg">{faq.q}</span>
                  <StatusBadge status={faq.status} />
                </summary>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-5 rounded-lg border-l-4 border-accent bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-bold uppercase">
                <PhoneCall className="size-5 text-primary" aria-hidden="true" /> Urgent help & organiser contacts
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{contacts.body}</p>
            </div>
            <StatusBadge status={contacts.status} />
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative overflow-hidden bg-foreground py-24 text-background">
        <img
          src={guideImage}
          alt="Skiers checking a piste map together in Val Thorens"
          width={1200}
          height={1600}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-7xl px-5 text-center">
          <h2 className="text-3xl uppercase leading-tight sm:text-6xl">See you at 2,300m.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-background/85">
            This page is the only place you need to check. When something is decided, it appears here and the date at the
            bottom changes.
          </p>
          <Button asChild variant="frost" className="mt-8 bg-background text-foreground hover:bg-background/90">
            <a href="#price">
              Book your place <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {trip.destination} · {trip.dates} · {trip.people} of us
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" /> Last updated {trip.updated}
        </p>
      </footer>
    </div>
  );
}
