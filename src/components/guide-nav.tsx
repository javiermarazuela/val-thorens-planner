import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Plane, Users } from "lucide-react";

import sscLogo from "@/assets/ssc-logo.jpg";
import { Button } from "@/components/ui/button";
import { useCrewAccess } from "@/lib/social/source";
import { goToSection, scrollToTop } from "@/lib/use-scroll-spy";
import type { Stop } from "@/lib/guide-order";
import { sectionMeta, site, trip, type Grade } from "@/lib/trip";

type StopState = "todo" | "current" | "done";

const gradeVar: Record<Grade, string> = {
  green: "var(--ink)",
  blue: "var(--ink)",
  red: "var(--ink)",
  black: "var(--ink)",
};

// A numbered piste marker: circle for green, square for blue, diamond for
// red and black. Filled once you are on or past it.
export function GradeMark({
  grade,
  n,
  state,
  size = "md",
}: {
  grade: Grade;
  n: string;
  state: StopState;
  size?: "sm" | "md" | "lg";
}) {
  const colour = gradeVar[grade];
  const filled = state !== "todo";
  const box = size === "lg" ? "size-11 sm:size-14" : size === "sm" ? "size-6" : "size-8";
  const diamond = false;
  const shape = "rounded-full";
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center border-2 ${box} ${shape} ${diamond ? "rotate-45" : ""}`}
      style={{
        borderColor: colour,
        background: filled ? colour : "var(--card)",
        color: filled ? "var(--card)" : colour,
        boxShadow: state === "current" ? `0 0 0 3px var(--paper), 0 0 0 5px ${colour}` : undefined,
      }}
    >
      <span
        className={`font-display leading-none ${size === "lg" ? "text-base sm:text-xl" : size === "sm" ? "text-[0.65rem]" : "text-xs"} ${diamond ? "-rotate-45" : ""}`}
      >
        {n}
      </span>
    </span>
  );
}

function stateOf(i: number, current: number): StopState {
  return i === current ? "current" : i < current ? "done" : "todo";
}

// Desktop: the trail down the left edge. The line turns navy as you pass each stop.
// A skier in a tucked, downhill pose. The whole figure carves gently from side to
// side and bobs; a few flecks of snow fly off the back of the ski. Animation is in
// styles.css (.skier-*) and switches off for reduced motion.
function Skier() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-[18px] overflow-visible"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle className="skier-spray skier-spray-1" cx="1" cy="16" r="1.8" />
      <circle className="skier-spray skier-spray-2" cx="-1" cy="21" r="1.4" />
      <circle className="skier-spray skier-spray-3" cx="3" cy="24" r="1.2" />
      <g className="skier-body">
        <circle cx="26.5" cy="6" r="3" fill="currentColor" stroke="none" />
        <path strokeWidth="2.2" d="M3 7 22 18" />
        <path strokeWidth="3.4" d="M22 8 15 12.5" />
        <path strokeWidth="3.4" d="M15 12.5 22 17.5 14.5 23" />
        <path strokeWidth="2.6" d="M22 9.5 23.5 14 29 15.5" />
        <path strokeWidth="2.4" d="M1.5 21 28 29" />
      </g>
    </svg>
  );
}

export function GuideRail({ stops, current }: { stops: Stop[]; current: number }) {
  const list = useRef<HTMLOListElement>(null);
  const [skierY, setSkierY] = useState<number | null>(null);
  const [skiing, setSkiing] = useState(false);

  // The skier only skis while the page scrolls, and coasts for a moment after.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setSkiing(true);
      clearTimeout(timer);
      timer = setTimeout(() => setSkiing(false), 1200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  // Park the skier beside the current stop; it glides there when the stop changes.
  useLayoutEffect(() => {
    const place = () => {
      const li = list.current?.querySelectorAll<HTMLElement>(":scope > li")[current];
      if (li) setSkierY(li.offsetTop + li.offsetHeight / 2);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [current, stops.length]);

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-y-0 left-0 z-40 hidden w-[var(--rail-w)] flex-col overflow-y-auto border-r border-border bg-paper py-7 pl-3 pr-3 min-[1100px]:flex"
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToTop();
        }}
        aria-label={site.backToTopLabel}
      >
        <span className="block font-display text-lg uppercase leading-none">{site.name}</span>
        <span className="mt-1.5 block text-xs font-bold text-muted-foreground">
          {trip.datesShort}
        </span>
      </a>
      <ol ref={list} className="relative my-auto pl-7 pt-6">
        {skierY !== null && (
          <span
            aria-hidden="true"
            data-skiing={skiing}
            className="pointer-events-none absolute left-1 top-0 text-ink transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateY(${skierY - 10}px)` }}
          >
            <Skier />
          </span>
        )}
        {stops.map((s, i) => (
          <li key={s.id} className="relative">
            <button
              type="button"
              onClick={() => goToSection(s.id)}
              aria-current={i === current ? "step" : undefined}
              className="flex min-h-9 w-full items-center gap-3 rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GradeMark
                grade={sectionMeta[s.id].grade}
                n={s.n}
                state={stateOf(i, current)}
                size="sm"
              />
              <span
                className={`text-sm leading-tight ${i === current ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </button>
            {i < stops.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-[calc(100%-6px)] h-3 w-0.5 ${i < current ? "bg-ink" : "bg-border"}`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Tells the flights card (in Getting here & away) to open, even when the hash is
// already #flights and so will not change.
const openFlights = () => window.dispatchEvent(new Event("open-flights"));

// Sticky top bar. Phone: wordmark, Members button and a scrolling chip bar.
// Desktop: the current section's name (the rail does the navigating).
export function GuideHeader({
  stops,
  current,
  progress,
}: {
  stops: Stop[];
  current: number;
  progress: number;
}) {
  const chips = useRef<HTMLDivElement>(null);
  const crew = useCrewAccess();

  useEffect(() => {
    const box = chips.current;
    const chip = box?.querySelector<HTMLElement>(`[data-chip="${current}"]`);
    if (!box || !chip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ left: chip.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
  }, [current]);

  const now = stops[current];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          className="flex min-h-11 items-center gap-2.5 min-[1100px]:hidden"
          aria-label={site.backToTopLabel}
        >
          <img
            src={sscLogo}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-md object-cover"
          />
          <span className="hidden font-display text-sm uppercase leading-none min-[440px]:inline">
            {site.name}
          </span>
        </a>
        <p className="hidden text-sm font-bold min-[1100px]:block" aria-live="polite">
          {now && (
            <>
              <span className="mr-2 text-muted-foreground">{now.n}</span>
              {now.label}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-md">
            <a href="#flights" onClick={openFlights}>
              <Plane aria-hidden="true" className="size-4" />
              My flights
            </a>
          </Button>
          {crew.signedIn && (
            <Button asChild variant="outline" size="sm" className="rounded-md">
              <a href="/crew#teams" aria-label="Crew">
                <Users aria-hidden="true" className="size-4" />
                <span className="hidden min-[440px]:inline">Crew</span>
              </a>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="rounded-md">
            <a href="/members">Members</a>
          </Button>
        </div>
      </div>
      <div
        ref={chips}
        className="flex gap-2 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] min-[1100px]:hidden [&::-webkit-scrollbar]:hidden"
      >
        {stops.map((s, i) => (
          <button
            key={s.id}
            type="button"
            data-chip={i}
            onClick={() => goToSection(s.id)}
            aria-current={i === current ? "step" : undefined}
            className={`flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border-[1.5px] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === current ? "border-ink bg-ink text-paper" : "border-border bg-card text-foreground"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="h-[3px] bg-border">
        <div className="h-[3px] bg-ink" style={{ width: `${progress * 100}%` }} />
      </div>
    </header>
  );
}
