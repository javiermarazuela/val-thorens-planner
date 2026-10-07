import { MapPin } from "lucide-react";

import kashmirImage from "@/assets/hotel-hameau-du-kashmir.jpg";
import oxalysImage from "@/assets/residence-l-oxalys.jpg";
import stayImage from "@/assets/residence-village-montana.jpg";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { googleMapsUrl, stay } from "@/lib/trip";

const otherImages: Record<string, string> = {
  "Résidence L’Oxalys": oxalysImage,
  "Hôtel Le Hameau du Kashmir": kashmirImage,
};

const mapsLink =
  "inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline";

export function Stay({ n, tone }: SectionProps) {
  return (
    <GuideSection id="stay" n={n} tone={tone} title={stay.title}>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="md:order-2">
          <figure className="aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
            <img
              src={stayImage}
              alt={stay.imageAlt}
              width={2048}
              height={1366}
              loading="lazy"
              className="h-full w-full object-cover object-[55%_55%]"
            />
          </figure>
        </div>
        <div>
          <h3 className="text-lg font-semibold leading-tight sm:text-xl">{stay.name}</h3>
          <a href={googleMapsUrl(stay.name)} target="_blank" rel="noreferrer" className={mapsLink}>
            <MapPin className="size-4" aria-hidden="true" />
            {stay.directionsLabel}
          </a>
          <p className="mt-2 border-l-4 border-accent pl-3 text-sm leading-relaxed">
            {stay.roomsNote}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-semibold">
          {stay.othersTitle}{" "}
          <span className="text-sm font-normal normal-case italic text-muted-foreground">
            {stay.othersQualifier}
          </span>
        </h3>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {stay.others.map((p) => (
            <li key={p.name} className="overflow-hidden rounded-xl border border-border bg-card">
              {otherImages[p.name] && (
                <img
                  src={otherImages[p.name]}
                  alt={p.name}
                  width={1500}
                  height={685}
                  loading="lazy"
                  className="aspect-[2.4/1] w-full object-cover"
                />
              )}
              <div className="px-4 py-3">
                <h4 className="text-base font-semibold">{p.name}</h4>
                <p className="text-sm text-muted-foreground">{p.type}</p>
                <a
                  href={googleMapsUrl(p.name)}
                  target="_blank"
                  rel="noreferrer"
                  className={mapsLink}
                >
                  <MapPin className="size-4" aria-hidden="true" />
                  {stay.directionsLabel}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </GuideSection>
  );
}
