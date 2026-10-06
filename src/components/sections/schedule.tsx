import { useEffect, useState } from "react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { dayDetails, dayDetailsStatus, week, weekSection } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";

export function Schedule({ n, tone }: SectionProps) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(tripDayIndex(new Date())), []);

  return (
    <GuideSection id="schedule" n={n} tone={tone} title={weekSection.title}>
      <div className="mb-3">
        <StatusBadge status={dayDetailsStatus} />
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {week.map((day, i) => {
          const events = dayDetails[i]?.events ?? [];
          const isToday = today === i;
          return (
            <li
              key={day.date}
              className={`flex flex-col rounded-2xl border-[1.5px] bg-card p-4 ${isToday ? "border-ink" : "border-border"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {day.day} · Jan{isToday ? " · Today" : ""}
                </span>
                <span className="font-display text-3xl leading-[0.9]">
                  {day.date.split(" ")[0]}
                </span>
              </div>
              <h3 className="mt-2 font-sans text-base font-bold normal-case leading-snug">
                {day.title}
              </h3>
              {events.length > 0 && (
                <ul className="mt-3 border-t border-border pt-1">
                  {events.map((e) => (
                    <li key={e.what} className="flex gap-3 py-1 text-sm">
                      <b className="w-14 shrink-0">{e.time}</b>
                      <span>{e.what}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </GuideSection>
  );
}
