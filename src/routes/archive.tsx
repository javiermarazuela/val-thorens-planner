import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Check, ExternalLink, X } from "lucide-react";

import offSlopeImage from "@/assets/val-thorens-offslope.jpg";
import { SectionIntro } from "@/components/section-intro";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { keyDates, pricing, resortFacts, resortIntro, site } from "@/lib/trip";

// The trip sold out, so the sign-up pitch no longer lives on the home page.
// It is kept here, unlinked and hidden from search engines, in case it is needed again.
export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [{ title: `Archive · ${site.title}` }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Archive,
});

function Archive() {
  return (
    <div className="pt-20">
      <p className="mx-auto max-w-3xl px-5 pt-6 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Archive: the original sign-up page. The trip is sold out.
      </p>
      <section className="border-b border-border bg-card py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {pricing.amountLead}
            </p>
            <p className="mt-2 font-display text-5xl leading-none sm:text-6xl">{pricing.amount}</p>
            <p className="mt-3 font-semibold">{pricing.unit}</p>
            <p className="mt-1 text-sm text-muted-foreground">{pricing.nonMemberNote}</p>
            <Button asChild className="mt-6 h-12 w-full px-8 text-base sm:w-auto">
              <a href={pricing.signupUrl} target="_blank" rel="noreferrer">
                {pricing.signupLabel} <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-5 border-t border-border pt-6 sm:gap-x-10">
            <div>
              <p className="flex items-center gap-1.5 font-display text-base uppercase">
                <Check className="size-5 text-primary" strokeWidth={3} aria-hidden="true" />
                {pricing.includesTitle}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug marker:text-muted-foreground">
                {pricing.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-display text-base uppercase">
                <X className="size-5 text-muted-foreground" strokeWidth={3} aria-hidden="true" />
                {pricing.excludesTitle}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-snug marker:text-muted-foreground">
                {pricing.excludes.map((item) => (
                  <li key={item.label}>
                    <span className="font-semibold">{item.label}</span>
                    {item.price && <span className="text-muted-foreground"> ({item.price})</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            {pricing.note}
          </p>

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
        <SectionIntro title={resortIntro.title} />
        <div className="mx-auto mt-8 grid max-w-5xl gap-8 px-5 sm:mt-10 sm:gap-10 md:grid-cols-2 md:items-center xl:max-w-6xl">
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
            <p className="text-lg leading-relaxed text-muted-foreground">{resortIntro.body}</p>
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
    </div>
  );
}
