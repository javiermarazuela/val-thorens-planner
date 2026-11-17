import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

import { EventIcon } from "@/components/event-icon";
import { StatusBadge } from "@/components/status-badge";
import { ThemeTag } from "@/components/theme-tag";
import { crewOn, useCrewAccess } from "@/lib/social/source";
import { challengeAt } from "@/lib/social/teams-content";
import {
  dailyChallengeStatus,
  mountain,
  week,
  weekStatus,
  dayIcon,
  weekDayLabel,
} from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";
import { appNow } from "@/lib/now";

const snowReport = mountain.links.find((l) => l.label === "Snow report");

const label = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

// A compact dashboard for one day of the trip, the same for everyone. It opens
// on the real day during the trip and on day 1 before it; the buttons switch day.
export function TodayCard() {
  const [day, setDay] = useState(0);
  const [today, setToday] = useState<number | null>(null);
  const [games, setGames] = useState(false); // challenge of the day, only when Crew is on
  const crew = useCrewAccess();

  useEffect(() => {
    const index = tripDayIndex(appNow());
    setToday(index);
    if (index !== null) setDay(index);
    setGames(crewOn());
  }, []);

  const info = week[day];
  if (!info) return null;

  return (
    <div className="rounded-3xl border-[1.5px] border-border bg-card p-5 shadow-[0_12px_40px_-20px_oklch(0.27_0.06_258/0.45)] sm:p-7">
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
            <span className="text-[0.7rem] font-semibold uppercase">{d.weekday}</span>
            <span className="font-display text-lg leading-none">{d.date.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {info.theme && (
          <div className="mb-2">
            <ThemeTag theme={info.theme} />
          </div>
        )}
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          {today === day ? "Today" : "Day"} · {day + 1} of {week.length} · {weekDayLabel(info)}
        </p>
        <h2 className="mt-1 text-lg font-semibold leading-tight sm:text-xl">{info.title}</h2>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-mint p-4 sm:row-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Events</p>
            <StatusBadge status={weekStatus} />
          </div>
          <ul className="mt-2">
            <li className="flex items-center gap-3 border-b border-border py-2.5 text-sm sm:text-base">
              <EventIcon icon={dayIcon(info, day)} />
              <span>{info.slopeDay ? "Slope day" : info.title}</span>
            </li>
            {info.events.map((e, ei) => {
              const challenge =
                crew.signedIn && crew.team !== null ? challengeAt(day, ei) : undefined;
              return (
                <li
                  key={ei}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border py-2.5 text-sm last:border-b-0 sm:text-base"
                >
                  <EventIcon icon={e.icon} />
                  <span>
                    {e.time && <span className="text-muted-foreground">{e.time} · </span>}
                    {e.title}
                    {e.venue && <span className="text-muted-foreground"> · {e.venue}</span>}
                  </span>
                  {e.status && <StatusBadge status={e.status} />}
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
            <p className={label}>Next bus</p>
            <StatusBadge status={info.busStatus} />
          </div>
          <p className="mt-2 text-base font-semibold leading-snug">{info.bus}</p>
        </div>

        <div className="rounded-2xl bg-mint p-4">
          <p className={label}>Weather &amp; snow</p>
          <p className="mt-2 text-base font-semibold leading-snug">
            Live forecast coming. Until then, the resort’s own report is one tap away.
          </p>
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

        {games && (
          <div className="rounded-2xl bg-mustard/30 p-4 text-ink">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wider">Challenge of the day</p>
              <StatusBadge status={dailyChallengeStatus} />
            </div>
            <p className="mt-2 text-base font-semibold leading-snug">{info.challenge}</p>
          </div>
        )}
      </div>
    </div>
  );
}
