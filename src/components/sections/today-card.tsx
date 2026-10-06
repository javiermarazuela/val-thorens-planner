import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { dayDetails, dayDetailsStatus, mountain, week } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";

const snowReport = mountain.links.find((l) => l.label === "Snow report");

const label = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

// A compact dashboard for one day of the trip, the same for everyone. It opens
// on the real day during the trip and on day 1 before it; the buttons switch day.
export function TodayCard() {
  const [day, setDay] = useState(0);
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const index = tripDayIndex(new Date());
    setToday(index);
    if (index !== null) setDay(index);
  }, []);

  const info = week[day];
  const more = dayDetails[day];
  if (!info || !more) return null;

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
            <span className="text-[0.7rem] font-semibold uppercase">{d.day}</span>
            <span className="font-display text-lg leading-none">{d.date.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          {today === day ? "Today" : "Day"} · {day + 1} of {week.length} · {info.day} {info.date}
        </p>
        <h2 className="mt-1 text-lg font-semibold leading-tight sm:text-xl">{info.title}</h2>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-mint p-4 sm:row-span-2">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Events</p>
            <StatusBadge status={dayDetailsStatus} />
          </div>
          <ul className="mt-2">
            {more.events.map((e) => (
              <li
                key={e.what}
                className="flex gap-3 border-b border-border py-2.5 text-sm last:border-b-0 sm:text-base"
              >
                <b className="w-14 shrink-0">{e.time}</b>
                <span>{e.what}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-mint p-4">
          <div className="flex items-center justify-between gap-2">
            <p className={label}>Next bus</p>
            <StatusBadge status={more.busStatus} />
          </div>
          <p className="mt-2 text-base font-semibold leading-snug">{more.bus}</p>
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

        <div className="rounded-2xl bg-mustard/30 p-4 text-ink">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wider">Challenge of the day</p>
            <StatusBadge status={dayDetailsStatus} />
          </div>
          <p className="mt-2 text-base font-semibold leading-snug">{more.challenge}</p>
        </div>
      </div>
    </div>
  );
}
