import { useEffect, useState } from "react";

import { EventIcon } from "@/components/event-icon";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { useCrewAccess } from "@/lib/social/source";
import { challengeAt } from "@/lib/social/teams-content";
import { dayDetails, dayDetailsStatus, week, weekSection } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";
import { appNow } from "@/lib/now";

// The eight days as cards. With `onPick`, each card is a button that opens that day.
export function WeekList({
  today,
  onPick,
}: {
  today: number | null;
  onPick?: (index: number) => void;
}) {
  const { signedIn, team } = useCrewAccess();
  const showChallenges = signedIn && team !== null;

  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {week.map((day, i) => {
        const events = dayDetails[i]?.events ?? [];
        const isToday = today === i;
        const body = (
          <>
            <div className="flex w-full items-baseline justify-between gap-3 bg-primary/10 px-4 py-3">
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
            <div className="w-full p-4 pt-3 text-left">
              <p className="flex items-center gap-2.5 text-base font-semibold">
                <EventIcon icon={day.daytime.icon} />
                {day.daytime.label}
              </p>
              {events.length > 0 && (
                <ul className="mt-3 border-t border-border pt-1">
                  {events.map((e, ei) => {
                    const challenge = showChallenges ? challengeAt(i, ei) : undefined;
                    return (
                      <li key={e.what} className="py-1.5 text-sm">
                        <span className="flex items-center gap-2.5">
                          <EventIcon icon={e.icon} />
                          <span>{e.what}</span>
                        </span>
                        {challenge && (
                          <span className="ml-[calc(1.5rem+0.625rem)] mt-1 inline-flex rounded-full bg-mustard/40 px-2.5 py-0.5 text-xs font-bold">
                            Team challenge: {challenge.title}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        );
        const box = `flex flex-col overflow-hidden rounded-2xl border-[1.5px] bg-card ${isToday ? "border-ink" : "border-border"}`;
        return (
          <li key={day.date}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(i)}
                className={`${box} h-full w-full items-stretch hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
              >
                {body}
              </button>
            ) : (
              <div className={`${box} h-full`}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Schedule({ n, tone }: SectionProps) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(tripDayIndex(appNow())), []);

  return (
    <GuideSection id="schedule" n={n} tone={tone} title={weekSection.title}>
      <div className="mb-3">
        <StatusBadge status={dayDetailsStatus} />
      </div>
      <WeekList today={today} />
    </GuideSection>
  );
}
