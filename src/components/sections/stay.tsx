import { MapPin } from "lucide-react";

import stayImage from "@/assets/residence-village-montana.jpg";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { googleMapsUrl, stay } from "@/lib/trip";

export function Stay({ n, tone }: SectionProps) {
  return (
    <GuideSection id="stay" n={n} tone={tone} title={stay.title}>
      <div className="grid gap-8 sm:gap-10 md:grid-cols-2 md:items-center">
        <div className="md:order-2">
          <figure className="aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
            {/* The photo is 2048x1366, close to the 4:3 frame. */}
            <img
              src={stayImage}
              alt={stay.imageAlt}
              width={2048}
              height={1366}
              loading="lazy"
              className="h-full w-full object-cover object-[55%_50%]"
            />
          </figure>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">
            {stay.mainTag}
          </p>
          <h3 className="mt-1 text-2xl uppercase leading-tight sm:text-3xl">{stay.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{stay.address}</p>
          <a
            href={googleMapsUrl(stay.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4 hover:no-underline"
          >
            <MapPin className="size-4" aria-hidden="true" />
            {stay.directionsLabel}
          </a>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{stay.intro}</p>
          <p className="mt-5 border-l-4 border-accent pl-4 text-sm leading-relaxed">
            {stay.roomsNote}
          </p>
        </div>
      </div>
      <div className="mt-12">
        <h3 className="text-xl uppercase">{stay.othersTitle}</h3>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {stay.others.map((p) => (
            <li key={p.name} className="rounded-2xl border-[1.5px] border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {p.type}
              </p>
              <h4 className="mt-1 text-lg font-bold">{p.name}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{p.address}</p>
              <p className="mt-3 text-sm leading-relaxed">{p.note}</p>
              <a
                href={googleMapsUrl(p.name)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4 hover:no-underline"
              >
                <MapPin className="size-4" aria-hidden="true" />
                {stay.directionsLabel}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </GuideSection>
  );
}
