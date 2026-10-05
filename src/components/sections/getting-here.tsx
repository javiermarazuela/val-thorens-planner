import { useState } from "react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { airportCoaches, checkSteps, gettingHere, otherRoutes, type Flight } from "@/lib/trip";

const muted = "text-muted-foreground";

// The coach that suits a flight home: the latest one whose earliest flight
// time the flight meets. Flights earlier than that have no group coach.
function homeCoach(flight: Flight): string | null {
  const suits = airportCoaches.home.coaches.filter((c) => flight.dep >= c.flightsFrom);
  const coach = suits[suits.length - 1];
  return coach ? `Coach ${coach.time}` : null;
}

function FlightList({
  title,
  date,
  flights,
  coachFor,
}: {
  title: string;
  date: string;
  flights: Flight[];
  coachFor?: (f: Flight) => string | null;
}) {
  const [open, setOpen] = useState(false);
  const nonstop = flights.filter((f) => f.nonstop);
  const rest = flights.filter((f) => !f.nonstop);
  const shown = open ? [...nonstop, ...rest] : nonstop;

  return (
    <div className="flex flex-col rounded-2xl bg-card px-4 pb-2 pt-4 sm:px-5">
      <div className="flex items-baseline justify-between gap-3 border-b border-border pb-3">
        <h3 className="text-lg uppercase">{title}</h3>
        <span className={`text-sm ${muted}`}>{date}</span>
      </div>
      <ul>
        {shown.map((f) => {
          const coach = coachFor ? (coachFor(f) ?? gettingHere.noCoach) : null;
          return (
            <li
              key={`${f.number}-${f.dep}`}
              className="flex items-center gap-3 border-b border-border py-2 last:border-b-0"
            >
              <span className="w-[7.5rem] shrink-0 text-sm font-bold tabular-nums sm:text-base">
                {f.dep} → {f.arr}
                {f.nextDay && (
                  <sup className={`ml-0.5 text-[0.65rem] font-semibold ${muted}`}>+1</sup>
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm sm:text-base">{f.route}</span>
                <span className={`text-xs sm:text-sm ${muted}`}>
                  {f.airline} · {f.number} ·{" "}
                  {f.nonstop ? gettingHere.nonstopLabel : gettingHere.oneStopLabel}
                </span>
              </span>
              {coach && <span className={`shrink-0 text-xs font-semibold ${muted}`}>{coach}</span>}
            </li>
          );
        })}
      </ul>
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-8 items-center text-sm font-bold text-primary underline underline-offset-4 hover:no-underline"
        >
          {open ? gettingHere.showFewer : gettingHere.showMore(rest.length)}
        </button>
      )}
    </div>
  );
}

export function GettingHere({ n, tone }: SectionProps) {
  const [alts, setAlts] = useState(false);

  return (
    <GuideSection id="getting-here" n={n} tone={tone} title={gettingHere.title}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h3 className="text-lg uppercase">Flights</h3>
        <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm sm:text-base">
          {[gettingHere.airport, gettingHere.arrive, gettingHere.leave].map((x) => (
            <span key={x.label} className="whitespace-nowrap">
              <span className={muted}>{x.label}</span> <b>{x.value}</b>
            </span>
          ))}
        </p>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <FlightList
          title={gettingHere.out.title}
          date={gettingHere.out.date}
          flights={gettingHere.out.flights}
        />
        <FlightList
          title={gettingHere.home.title}
          date={gettingHere.home.date}
          flights={gettingHere.home.flights}
          coachFor={homeCoach}
        />
      </div>

      <div className="mt-3 rounded-2xl bg-card px-4 py-0.5 sm:px-5">
        <button
          type="button"
          onClick={() => setAlts((v) => !v)}
          aria-expanded={alts}
          className="flex min-h-10 w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <b className="text-base">{otherRoutes.title}</b>
            <span className={`ml-3 text-sm ${muted}`}>{otherRoutes.summary}</span>
          </span>
          <span className="flex items-center gap-3">
            <StatusBadge status={otherRoutes.status} />
            <span className="text-xl font-semibold">{alts ? "−" : "+"}</span>
          </span>
        </button>
        {alts && (
          <ul className="pb-3">
            {otherRoutes.items.map((r) => (
              <li key={r.title} className="border-t border-border py-3">
                <b>{r.title}</b>
                <p className={`mt-1 text-sm ${muted}`}>{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h3 className="text-lg uppercase">{airportCoaches.title}</h3>
        <StatusBadge status={airportCoaches.status} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {airportCoaches.out.title}
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            {airportCoaches.out.times.map((t) => (
              <span key={t} className="rounded-lg bg-ink px-3 py-1 font-display text-lg text-paper">
                {t}
              </span>
            ))}
          </p>
        </div>
        <div className="rounded-2xl border-[1.5px] border-border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {airportCoaches.home.title}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {airportCoaches.home.coaches.map((c) => (
              <li key={c.time} className="flex items-center gap-2">
                <span className="rounded-lg bg-ink px-3 py-1 font-display text-lg text-paper">
                  {c.time}
                </span>
                <span className={`text-xs ${muted}`}>for flights from {c.flightsFrom}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h3 className="text-lg uppercase">{checkSteps.title}</h3>
        <StatusBadge status={checkSteps.status} />
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2 md:gap-8">
        {checkSteps.items.map((s) => (
          <div key={s.n} className="border-t-[1.5px] border-ink pt-3">
            <h4 className="flex items-baseline gap-2 text-base font-bold">
              <span className="font-display text-sm text-signal">{s.n}</span>
              {s.h}
            </h4>
            <p className={`mt-1 text-sm leading-relaxed ${muted}`}>{s.p}</p>
          </div>
        ))}
      </div>
    </GuideSection>
  );
}
