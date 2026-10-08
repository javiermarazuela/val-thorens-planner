import { Bus, ChevronDown, ExternalLink, House, Moon } from "lucide-react";
import type { ReactNode } from "react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { ShuttleMap } from "@/components/shuttle-map";
import { gettingAround } from "@/lib/trip";

const muted = "text-muted-foreground";
const smallTitle = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

const { tiles, shuttle, valley } = gettingAround;

function Tile({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-tight">{title}</h3>
        <div className="mt-1 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// Every stop in order, loop by loop, with the stops that serve our places picked out.
function StopList({ loop }: { loop: (typeof shuttle.loops)[number] }) {
  // Two of our places share a stop, so a stop can carry more than one name.
  const ours = new Map<string, string>();
  for (const s of shuttle.stays) {
    ours.set(s.stop, [ours.get(s.stop), s.name].filter(Boolean).join(" · "));
  }
  const stops = [shuttle.hub.name, ...loop.stops.map((s) => s.name), shuttle.hub.name];
  return (
    <div>
      <h4 className="flex items-center gap-2 text-base font-semibold">
        <span
          className={`size-3 ${loop.id === "east" ? "rounded-[3px]" : "rounded-full"}`}
          style={{ background: loop.color }}
          aria-hidden="true"
        />
        {loop.name}
      </h4>
      <p className={`mt-0.5 text-sm ${muted}`}>{loop.note}</p>
      <ol className="mt-2 text-sm sm:text-base">
        {stops.map((name, i) => {
          const stay = ours.get(name);
          return (
            <li key={`${name}-${i}`} className="flex flex-wrap items-center gap-x-2 py-0.5">
              <span className={`w-5 text-xs tabular-nums ${muted}`}>{i + 1}</span>
              <span className={stay ? "font-bold" : ""}>{name}</span>
              {stay && (
                <span className="rounded-full bg-mustard/50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase">
                  {stay}
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
  return (
    <GuideSection id="around" n={n} tone={tone} title={gettingAround.title}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-start">
        <div className="grid gap-3">
          <Tile icon={<House className="size-5" aria-hidden="true" />} title={tiles.home.title}>
            <ul className="grid gap-1">
              {shuttle.stays.map((s) => (
                <li key={s.name} className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                  <span>{s.name}</span>
                  <b className="ml-auto rounded-full bg-mustard/50 px-2.5 py-0.5 text-xs font-semibold">
                    {s.stop}
                  </b>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile icon={<Moon className="size-5" aria-hidden="true" />} title={tiles.late.title}>
            <p>{tiles.late.body}</p>
          </Tile>

          <Tile icon={<Bus className="size-5" aria-hidden="true" />} title={tiles.valley.title}>
            <p>{tiles.valley.body}</p>
          </Tile>
        </div>

        <div>
          <ShuttleMap />
          <p className={`mt-2 text-center text-xs ${muted}`}>{shuttle.stayNote}</p>
        </div>
      </div>

      <details className="group mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 bg-secondary px-4 py-2 hover:bg-secondary/70 [&::-webkit-details-marker]:hidden">
          <span>
            <b className="text-base font-semibold">Timetable and all stops</b>
            <span className={`ml-3 hidden text-sm sm:inline ${muted}`}>
              Hours, every stop in order, and the valley bus
            </span>
          </span>
          <ChevronDown
            className="size-5 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="grid gap-5 border-t border-border px-4 pb-4 pt-4">
          <div>
            <h3 className="text-base font-semibold">{shuttle.title}</h3>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {shuttle.hours.map((h) => (
                <div key={h.days} className="rounded-xl bg-mint px-4 py-3">
                  <dt className={smallTitle}>{h.days}</dt>
                  <dd className="mt-1 text-xl font-semibold">{h.times}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm sm:text-base">{shuttle.frequency}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-8">
            {shuttle.loops.map((l) => (
              <StopList key={l.id} loop={l} />
            ))}
          </div>

          <div>
            <h3 className="text-base font-semibold">{valley.title}</h3>
            <p className="mt-1 text-sm sm:text-base">{valley.body}</p>
          </div>

          <div>
            <p className={`border-l-4 border-accent pl-4 text-sm leading-relaxed ${muted}`}>
              {shuttle.seasonNote}
            </p>
            <a
              href={shuttle.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              {shuttle.link.label}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </details>
    </GuideSection>
  );
}
