import { useEffect, useState } from "react";

import heroImage from "@/assets/val-thorens-trip.jpg";
import { FlightsBanner } from "@/components/flights-banner";
import { hero, trip } from "@/lib/trip";
import { daysToGo } from "@/lib/trip-day";
import { appNow } from "@/lib/now";

export function Welcome() {
  const [toGo, setToGo] = useState<number | null>(null);
  const [banner, setBanner] = useState(false); // the "tell us how" strip is showing
  useEffect(() => setToGo(daysToGo(appNow())), []);

  return (
    <section id="welcome" className="scroll-mt-[var(--header-h)]">
      <div className="relative min-h-[32svh] overflow-hidden bg-ink sm:min-h-[38svh]">
        <img
          src={heroImage}
          alt={hero.imageAlt}
          width={1200}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/20" />
        <div
          className={`relative mx-auto flex min-h-[32svh] max-w-6xl flex-col items-center justify-end px-5 pt-10 text-center text-paper sm:min-h-[38svh] ${banner ? "pb-16" : "pb-8 sm:pb-10"}`}
        >
          <h1 className="whitespace-nowrap text-[clamp(1.75rem,8vw,2.25rem)] uppercase leading-none sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-2 text-sm leading-snug text-paper/90 sm:mt-3 sm:text-lg">
            {hero.tagline}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-bold sm:text-base">
            <span>{trip.datesMedium}</span>
            <span aria-hidden="true">·</span>
            <span>
              {trip.people} {hero.peopleSuffix}
            </span>
          </p>
          {toGo !== null && (
            <p className="mt-1 text-sm text-paper/90">
              {toGo === 1 ? "1 day to go" : `${toGo} days to go`}
            </p>
          )}
        </div>
        <FlightsBanner onVisible={setBanner} />
      </div>
    </section>
  );
}
