import heroImage from "@/assets/val-thorens-trip.jpg";
import { TodayCard } from "@/components/sections/today-card";
import { hero, trip } from "@/lib/trip";

export function Welcome() {
  return (
    <section id="welcome" className="scroll-mt-[var(--header-h)]">
      <div className="relative min-h-[55svh] overflow-hidden bg-ink sm:min-h-[70svh]">
        <img
          src={heroImage}
          alt={hero.imageAlt}
          width={1200}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/20" />
        <div className="relative mx-auto flex min-h-[55svh] max-w-6xl flex-col items-center justify-end px-5 pb-16 pt-12 text-center text-paper sm:min-h-[70svh] sm:pb-24">
          <h1 className="whitespace-nowrap text-[clamp(2rem,10.8vw,3rem)] uppercase leading-none sm:text-7xl lg:text-8xl xl:text-9xl">
            {hero.title}
          </h1>
          <p className="mt-3 text-base leading-snug text-paper/90 sm:mt-5 sm:text-xl">
            {hero.tagline}
          </p>
          <p className="mt-3 flex items-center gap-2 text-base font-bold sm:mt-4 sm:text-lg">
            <span>{trip.datesMedium}</span>
            <span aria-hidden="true">·</span>
            <span>
              {trip.people} {hero.peopleSuffix}
            </span>
          </p>
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 pb-12 sm:-mt-14 sm:px-5 sm:pb-16 xl:max-w-6xl">
        <TodayCard />
      </div>
    </section>
  );
}
