import { useEffect, useState } from "react";
import {
  ChevronDown,
  Cloud,
  CloudSnow,
  CloudSun,
  ExternalLink,
  Snowflake,
  Sun,
} from "lucide-react";

import { EventIcon } from "@/components/event-icon";
import { WeekList } from "@/components/sections/schedule";
import { useCrewAccess } from "@/lib/social/source";
import { challengeAt } from "@/lib/social/teams-content";
import { TransportTile } from "@/components/sections/transport-tile";
import { dayDetails, mountain, week } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";
import { appNow } from "@/lib/now";

const snowReport = mountain.links.find((l) => l.label === "Snow report");

// Test site only: src/test-data/weather.json holds an invented forecast and snow
// report per day, so the demo needs no weather API. A glob, so the real site
// builds without it, and a try for the bun scripts, where the glob doesn't exist.
type DayWeather = {
  sky: string;
  high: number;
  low: number;
  wind: string;
  fresh: string;
  base: string;
  lifts: [number, number]; // open, total
  snow: string; // conditions
};
let testWeather: DayWeather[] = [];
try {
  const mods = import.meta.glob<DayWeather[]>("../../test-data/weather.json", {
    eager: true,
    import: "default",
  });
  testWeather = Object.values(mods)[0] ?? [];
} catch {
  // not running under Vite
}

const label = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ordinal(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10] ?? "th"}`;
}

// "Saturday, January 9th" for day 0 to 7 of the trip (Saturday 9 January 2027).
function longDate(day: number): string {
  const d = new Date(Date.UTC(2027, 0, 9 + day));
  return `${WEEKDAYS[d.getUTCDay()]}, January ${ordinal(d.getUTCDate())}`;
}

// The icon that goes with the day's sky, picked from the words in it.
function SkyIcon({ sky, className }: { sky: string; className?: string }) {
  const s = sky.toLowerCase();
  const Icon = s.includes("heavy")
    ? Snowflake
    : s.includes("snow") || s.includes("flurr")
      ? CloudSnow
      : s.includes("spells") || s.includes("mostly") || s.includes("clearing")
        ? CloudSun
        : s.includes("cloud")
          ? Cloud
          : Sun;
  return <Icon className={className} aria-hidden="true" />;
}

// A compact dashboard for one day of the trip, the same for everyone. It opens
// on the real day during the trip and on day 1 before it; the buttons switch day,
// and "See the whole week" opens all eight days.
export function TodayCard() {
  const [day, setDay] = useState(0);
  const [today, setToday] = useState<number | null>(null);
  const [showWeek, setShowWeek] = useState(false);
  const crew = useCrewAccess();

  useEffect(() => {
    const index = tripDayIndex(appNow());
    setToday(index);
    if (index !== null) setDay(index);
  }, []);

  const info = week[day];
  const more = dayDetails[day];
  const forecast = testWeather[day];
  if (!info || !more) return null;

  return (
    <div className="rounded-3xl border-[1.5px] border-border bg-card p-5 shadow-[0_12px_40px_-20px_oklch(0.27_0.06_258/0.45)] sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h3 className="font-display text-3xl leading-tight sm:text-4xl">{longDate(day)}</h3>
          {today !== null && (
            <p className="mt-1 text-sm text-muted-foreground">
              {today === day ? (
                "Today"
              ) : (
                <button
                  type="button"
                  onClick={() => setDay(today)}
                  className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                  Back to today
                </button>
              )}
            </p>
          )}
        </div>
        <div
          role="tablist"
          aria-label="Pick a day"
          className="flex max-w-full gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {week.map((d, i) => (
            <button
              key={d.date}
              type="button"
              role="tab"
              aria-selected={i === day}
              onClick={() => setDay(i)}
              className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === day ? "bg-ink text-paper" : "bg-mint text-ink"}`}
            >
              <span className="text-[0.7rem] font-semibold uppercase">{d.day}</span>
              <span className="font-display text-lg leading-none">{d.date.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-mint p-4 sm:row-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Events</p>
          </div>
          <ul className="mt-2">
            <li className="flex items-center gap-3 border-b border-border py-2.5 text-sm sm:text-base">
              <EventIcon icon={info.daytime.icon} />
              <span>{info.daytime.label}</span>
            </li>
            {more.events.map((e, ei) => {
              const challenge =
                crew.signedIn && crew.team !== null ? challengeAt(day, ei) : undefined;
              return (
                <li
                  key={e.what}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border py-2.5 text-sm last:border-b-0 sm:text-base"
                >
                  <EventIcon icon={e.icon} />
                  <span>{e.what}</span>
                  {challenge && (
                    <span className="rounded-full bg-mustard/40 px-2.5 py-0.5 text-xs font-bold">
                      Team challenge: {challenge.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl bg-mint p-4">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Weather</p>
          </div>
          {forecast ? (
            <>
              <p className="mt-2 flex items-center gap-2.5 text-base font-semibold leading-snug">
                <SkyIcon sky={forecast.sky} className="size-7 shrink-0 text-primary" />
                <span>
                  {forecast.sky}, {forecast.high}° / {forecast.low}°C
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Wind {forecast.wind}</p>
            </>
          ) : (
            <p className="mt-2 text-base font-semibold leading-snug">
              Live forecast coming. Until then, the resort’s own report is one tap away.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-mint p-4">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Lifts &amp; snow</p>
          </div>
          {forecast && (
            <>
              <p className="mt-2 text-base font-semibold leading-snug">
                {forecast.lifts[0]}/{forecast.lifts[1]} lifts open
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {forecast.snow} · fresh snow {forecast.fresh} · base {forecast.base}
              </p>
            </>
          )}
          {snowReport && (
            <a
              href={snowReport.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              {snowReport.label}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <TransportTile day={day} />

        <div className="rounded-2xl bg-mustard/30 p-4 text-ink">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider">Challenge of the day</p>
          </div>
          <p className="mt-2 text-base font-semibold leading-snug">{more.challenge}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <button
          type="button"
          aria-expanded={showWeek}
          onClick={() => setShowWeek((v) => !v)}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showWeek ? "Hide the week" : "See the whole week"}
          <ChevronDown
            className={`size-4 transition-transform ${showWeek ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {showWeek && (
          <div className="mt-3">
            <WeekList
              today={today}
              onPick={(i) => {
                setDay(i);
                setShowWeek(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
