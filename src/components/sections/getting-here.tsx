import { useEffect, useState, type ReactNode } from "react";

import { FlightForm } from "@/components/flight-form";
import { FlightsDialog } from "@/components/flights-dialog";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { gettingHere, otherRoutes, type Flight } from "@/lib/trip";
import { useSession } from "@/lib/use-session";

const muted = "text-muted-foreground";

function FlightList({ flights }: { flights: Flight[] }) {
  const [open, setOpen] = useState(false);
  const nonstop = flights.filter((f) => f.nonstop);
  const rest = flights.filter((f) => !f.nonstop);
  const shown = open ? [...nonstop, ...rest] : nonstop;

  return (
    <div>
      <ul>
        {shown.map((f) => {
          return (
            <li
              key={`${f.number}-${f.dep}`}
              className="flex items-center gap-3 border-b border-border py-2"
            >
              <span className="w-[7.5rem] shrink-0 text-sm font-semibold tabular-nums sm:text-base">
                {f.dep} → {f.arr}
                {f.nextDay && (
                  <sup className={`ml-0.5 text-[0.65rem] font-medium ${muted}`}>+1</sup>
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm sm:text-base">{f.route}</span>
                <span className={`text-xs sm:text-sm ${muted}`}>
                  {f.airline} · {f.number} ·{" "}
                  {f.nonstop ? gettingHere.nonstopLabel : gettingHere.oneStopLabel}
                </span>
              </span>
              {f.nonstop && (
                <span className="shrink-0 text-xs font-medium text-teal">Recommended</span>
              )}
            </li>
          );
        })}
      </ul>
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-8 items-center text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
        >
          {open ? gettingHere.showFewer : gettingHere.showMore(rest.length)}
        </button>
      )}
    </div>
  );
}

function Leg({ title, date, children }: { title: string; date: string; children: ReactNode }) {
  return (
    <div>
      <div className="border-b-2 border-ink pb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className={`text-sm ${muted}`}>
          {date} · {gettingHere.airport.value}
        </p>
      </div>
      {children}
    </div>
  );
}

// Opens in place. Only mounted once opened, so the session check (browser
// only) never runs during server rendering.
function FlightsPanel({ onClose }: { onClose: () => void }) {
  const { supabase, session, authError, signIn } = useSession();

  if (!supabase)
    return <p className={`text-sm ${muted}`}>Flight details aren't switched on yet.</p>;
  if (session === undefined) return <p className={`text-sm ${muted}`}>Loading…</p>;
  if (!session) {
    return (
      <div>
        <p className="text-sm">
          Sign in with your Columbia Google account to add your flights. We only use it to know who
          is who.
        </p>
        {authError && (
          <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
            {authError}
          </p>
        )}
        <Button className="mt-4" onClick={signIn}>
          Sign in with Google
        </Button>
      </div>
    );
  }
  return <FlightForm supabase={supabase} session={session} onClose={onClose} />;
}

function FlightsCard() {
  const [open, setOpen] = useState(false);

  // "My flights" buttons elsewhere on the page open the pop-up.
  useEffect(() => {
    const openIfAsked = () => {
      if (window.location.hash === "#flights") setOpen(true);
    };
    const openNow = () => setOpen(true);
    openIfAsked();
    window.addEventListener("hashchange", openIfAsked);
    window.addEventListener("open-flights", openNow);
    return () => {
      window.removeEventListener("hashchange", openIfAsked);
      window.removeEventListener("open-flights", openNow);
    };
  }, []);

  return (
    <div
      id="flights"
      className="mt-6 flex scroll-mt-[calc(var(--header-h)+1rem)] flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-5 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <p className={`text-sm ${muted}`}>
        Tell us when you land and leave, and if you want a seat on the airport coach. You can change
        it any time.
      </p>
      <Button className="shrink-0" onClick={() => setOpen(true)}>
        Tell us how you're getting here
      </Button>
      <FlightsDialog open={open} onClose={() => setOpen(false)} title="How are you getting here?">
        <FlightsPanel onClose={() => setOpen(false)} />
      </FlightsDialog>
    </div>
  );
}

export function GettingHere({ n, tone }: SectionProps) {
  const [alts, setAlts] = useState(false);

  return (
    <GuideSection id="getting-here" n={n} tone={tone} title={gettingHere.title}>
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
        <Leg title="Arriving" date={gettingHere.out.date}>
          <FlightList flights={gettingHere.out.flights} />
        </Leg>

        <Leg title="Leaving" date={gettingHere.home.date}>
          <FlightList flights={gettingHere.home.flights} />
        </Leg>
      </div>

      <FlightsCard />

      <div className="mt-6 border-y border-border py-0.5">
        <button
          type="button"
          onClick={() => setAlts((v) => !v)}
          aria-expanded={alts}
          className="flex min-h-10 w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <b className="text-base font-semibold">{otherRoutes.title}</b>
            <span className={`ml-3 text-sm ${muted}`}>{otherRoutes.summary}</span>
          </span>
          <span className="flex items-center gap-3">
            <StatusBadge status={otherRoutes.status} />
            <span className="text-xl font-medium">{alts ? "−" : "+"}</span>
          </span>
        </button>
        {alts && (
          <ul className="pb-3">
            {otherRoutes.items.map((r) => (
              <li key={r.title} className="border-t border-border py-3">
                <b className="font-semibold">{r.title}</b>
                <p className={`mt-1 text-sm ${muted}`}>{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GuideSection>
  );
}
