import { useEffect, useState } from "react";

import { EventIcon } from "@/components/event-icon";
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
              className={`flex flex-col overflow-hidden rounded-2xl border-[1.5px] bg-card ${isToday ? "border-ink" : "border-border"}`}
            >
              <div className="flex items-baseline justify-between gap-3 bg-primary/10 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {day.day}
                  {isToday ? " · Today" : ""}
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    Jan
                  </span>
                  <span className="text-2xl font-semibold leading-none">
                    {day.date.split(" ")[0]}
                  </span>
                </span>
              </div>
              <div className="p-4 pt-3">
                <p className="flex items-center gap-2.5 text-base font-semibold">
                  <EventIcon icon={day.daytime.icon} />
                  {day.daytime.label}
                </p>
                {events.length > 0 && (
                  <ul className="mt-3 border-t border-border pt-1">
                    {events.map((e) => (
                      <li key={e.what} className="flex items-center gap-2.5 py-1.5 text-sm">
                        <EventIcon icon={e.icon} />
                        <span>{e.what}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </GuideSection>
  );
}
