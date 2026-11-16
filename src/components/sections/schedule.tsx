import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

import { EventIcon } from "@/components/event-icon";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { useCrewAccess } from "@/lib/social/source";
import { challengeAt } from "@/lib/social/teams-content";
import { week, weekSection, weekStatus, dayIcon } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";
import { appNow } from "@/lib/now";

export function Schedule({ n, tone }: SectionProps) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(tripDayIndex(appNow())), []);
  const { signedIn, team } = useCrewAccess();
  const showChallenges = signedIn && team !== null;

  return (
    <GuideSection id="schedule" n={n} tone={tone} title={weekSection.title}>
      {weekStatus === "soon" || weekStatus === "preliminary" ? (
        <div className="mb-3">
          <StatusBadge status={weekStatus} />
        </div>
      ) : null}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {week.map((day, i) => {
          const isToday = today === i;
          return (
            <li
              key={day.date}
              className={`flex flex-col overflow-hidden rounded-2xl border-[1.5px] bg-card ${isToday ? "border-ink" : "border-border"}`}
            >
              <div className="flex items-baseline justify-between gap-3 bg-primary/10 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {day.weekday}
                  {isToday ? " · Today" : ""}
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    {day.date.split(" ")[1]}
                  </span>
                  <span className="text-2xl font-semibold leading-none">
                    {day.date.split(" ")[0]}
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4 pt-3">
                <p className="flex items-center gap-2.5 text-base font-semibold">
                  <EventIcon icon={dayIcon(day, i)} />
                  {day.title}
                </p>
                {day.theme && (
                  <p className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-mustard px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-ink">
                      Theme: {day.theme}
                    </span>
                  </p>
                )}
                {day.events.length > 0 && (
                  <ul className="mt-3 divide-y divide-border border-t border-border">
                    {day.events.map((e, ei) => {
                      const challenge = showChallenges ? challengeAt(i, ei) : undefined;
                      return (
                        <li key={ei} className="py-2.5">
                          {e.time && (
                            <p className="text-xs font-medium uppercase tracking-wider text-primary">
                              {e.time}
                            </p>
                          )}
                          <p className="mt-0.5 flex items-start gap-2.5 text-sm font-semibold leading-snug">
                            <span className="mt-0.5">
                              <EventIcon icon={e.icon} />
                            </span>
                            <span>{e.title}</span>
                          </p>
                          <div className="ml-[calc(1rem+0.625rem)]">
                            {e.venue && (
                              <p className="mt-0.5 flex items-center gap-1 text-sm">
                                <MapPin
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Where: </span>
                                {e.venue}
                              </p>
                            )}
                            {e.description && (
                              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                                {e.description}
                              </p>
                            )}
                            {e.status && <StatusBadge status={e.status} className="mt-1.5" />}
                            {challenge && (
                              <span className="mt-1.5 inline-flex rounded-full bg-mustard/40 px-2.5 py-0.5 text-xs font-bold">
                                Team challenge: {challenge.title}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
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
