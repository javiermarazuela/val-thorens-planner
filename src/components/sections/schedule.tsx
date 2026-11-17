import { useEffect, useState } from "react";
import { MapPin, VenetianMask } from "lucide-react";

import { EventIcon } from "@/components/event-icon";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { useCrewAccess } from "@/lib/social/source";
import { challengeAt } from "@/lib/social/teams-content";
import { week, weekSection, weekStatus, dayIcon, weekDayLabel } from "@/lib/trip";
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
              className={`flex flex-col overflow-hidden rounded-2xl border-[1.5px] ${day.theme ? "bg-mustard/15" : "bg-card"} ${isToday ? "border-ink" : day.theme ? "border-mustard" : "border-border"}`}
            >
              {/* Date on the left. On a theme day the band turns mustard and names the theme,
                  and the rest of the card takes a light wash of the same colour. */}
              <div
                className={`flex min-h-12 items-center justify-between gap-3 px-4 py-2.5 ${day.theme ? "bg-mustard text-ink" : "bg-primary/10"}`}
              >
                <span className="text-base font-semibold">
                  {weekDayLabel(day)}
                  {isToday && (
                    <span className="ml-1.5 text-xs font-medium uppercase tracking-wider">
                      · Today
                    </span>
                  )}
                </span>
                {day.theme && (
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <VenetianMask className="size-[1.1rem] shrink-0" aria-hidden="true" />
                    {day.theme} theme
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 pt-3">
                <p className="flex items-center gap-2.5 text-base font-semibold">
                  <EventIcon icon={dayIcon(day, i)} />
                  {day.title}
                </p>
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
                          {/* The venue sits beside the title and drops below it when the card is narrow. */}
                          <div className="mt-0.5 flex items-start gap-2.5 text-sm leading-snug">
                            <span className="mt-0.5">
                              <EventIcon icon={e.icon} />
                            </span>
                            <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                              <span className="font-semibold">{e.title}</span>
                              {e.venue && (
                                <span className="inline-flex items-baseline gap-1">
                                  <MapPin
                                    className="size-3.5 shrink-0 self-center text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  <span className="sr-only">Where: </span>
                                  {e.venue}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="ml-[calc(1rem+0.625rem)]">
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
