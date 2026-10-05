import { ExternalLink } from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { gettingAround, mountain } from "@/lib/trip";

const muted = "text-muted-foreground";
const smallTitle = "text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground";

type Circuit = (typeof gettingAround.shuttle.circuits)[number];

// A stop-by-stop line, with the places we stay picked out.
function CircuitLine({ circuit }: { circuit: Circuit }) {
  return (
    <div className="border-t-[1.5px] border-ink pt-4">
      <h4 className="text-lg font-bold">{circuit.name}</h4>
      <p className={`mt-1 text-sm ${muted}`}>{circuit.note}</p>
      <ol className="mt-4">
        {circuit.stops.map((stop, i) => {
          const ours = circuit.highlight.includes(stop);
          return (
            <li key={stop} className="relative flex items-center gap-3 py-1.5">
              <span
                aria-hidden="true"
                className={`relative z-10 size-3 shrink-0 rounded-full border-2 ${ours ? "border-signal bg-signal" : "border-ink bg-card"}`}
              />
              {i < circuit.stops.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[5px] top-1/2 h-full w-0.5 bg-border"
                />
              )}
              <span className={`text-sm sm:text-base ${ours ? "font-bold" : ""}`}>{stop}</span>
              {ours && (
                <span className="rounded-full bg-mustard/50 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase">
                  Where we stay
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function GettingAround({ n, tone }: SectionProps) {
  const { shuttle } = gettingAround;

  return (
    <GuideSection
      id="around"
      n={n}
      tone={tone}
      title={gettingAround.title}
      intro={gettingAround.intro}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-card p-5 sm:p-7">
          <h3 className="text-2xl uppercase">{shuttle.title}</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {shuttle.hours.map((h) => (
              <div key={h.days} className="rounded-xl bg-mint p-4">
                <dt className={smallTitle}>{h.days}</dt>
                <dd className="mt-1 font-display text-2xl">{h.times}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-base font-semibold">{shuttle.frequency}</p>
          <p className={`mt-1 text-sm ${muted}`}>{shuttle.start}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
            {shuttle.circuits.map((c) => (
              <CircuitLine key={c.name} circuit={c} />
            ))}
          </div>

          <p className={`mt-6 border-l-4 border-accent pl-4 text-sm leading-relaxed ${muted}`}>
            {shuttle.seasonNote}
          </p>
          <a
            href={shuttle.link.href}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4 hover:no-underline"
          >
            {shuttle.link.label}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border-[1.5px] border-border bg-card p-5">
            <p className={smallTitle}>{mountain.title}</p>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">{mountain.intro}</p>
            <p className="mt-3 border-l-4 border-accent pl-4 text-sm leading-relaxed">
              {mountain.note}
            </p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-border bg-card p-5">
            <p className={smallTitle}>{gettingAround.home.title}</p>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">{gettingAround.home.body}</p>
          </div>
          <div className="rounded-2xl border-[1.5px] border-border bg-card p-5">
            <p className={smallTitle}>{gettingAround.valley.title}</p>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">{gettingAround.valley.body}</p>
          </div>
        </div>
      </div>
    </GuideSection>
  );
}
