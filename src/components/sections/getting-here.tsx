import { Bus, CalendarDays, ChevronDown, Plane, TrainFront } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { FlightForm } from "@/components/flight-form";
import { FlightsDialog } from "@/components/flights-dialog";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { gettingHere, otherRoutes, type Flight, type OtherRouteIcon } from "@/lib/trip";
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

function FlightsButton() {
  const [open, setOpen] = useState(false);

  // The "My flights" button in the header and the banner on the welcome photo
  // open the pop-up from elsewhere on the page.
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
    <div id="flights" className="mt-8 flex scroll-mt-[calc(var(--header-h)+1rem)] justify-center">
      <Button onClick={() => setOpen(true)}>Tell us how you're getting here</Button>
      <FlightsDialog open={open} onClose={() => setOpen(false)} title="How are you getting here?">
        <FlightsPanel onClose={() => setOpen(false)} />
      </FlightsDialog>
    </div>
  );
}

// A closed-by-default row: title and a one-line summary, a + to open it.
// `featured` is the bigger version with an icon, for the row that matters most.
function Expander({
  title,
  summary,
  badge,
  icon,
  featured = false,
  children,
}: {
  title: string;
  summary: string;
  badge?: ReactNode;
  icon?: ReactNode;
  featured?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 bg-secondary px-4 text-left transition hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${featured ? "min-h-16 py-3" : "min-h-14 py-2"}`}
      >
        <span className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper">
              {icon}
            </span>
          )}
          {featured ? (
            <span className="min-w-0">
              <b className="block text-lg font-semibold leading-tight">{title}</b>
              <span className={`mt-0.5 block text-sm ${muted}`}>{summary}</span>
            </span>
          ) : (
            <span>
              <b className="text-base font-semibold">{title}</b>
              <span className={`ml-3 text-sm ${muted}`}>{summary}</span>
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {badge}
          <ChevronDown
            className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>
      {open && <div className="border-t border-border px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

const routeIcons: Record<OtherRouteIcon, ReactNode> = {
  bus: <Bus className="size-5" aria-hidden="true" />,
  train: <TrainFront className="size-5" aria-hidden="true" />,
  calendar: <CalendarDays className="size-5" aria-hidden="true" />,
};

export function GettingHere({ n, tone }: SectionProps) {
  return (
    <GuideSection id="getting-here" n={n} tone={tone} title={gettingHere.title}>
      <div>
        <Expander
          featured
          icon={<Plane className="size-5" aria-hidden="true" />}
          title={gettingHere.recommended.title}
          summary={gettingHere.recommended.summary}
        >
          <div className="grid gap-x-10 gap-y-8 pt-2 lg:grid-cols-2">
            <Leg title="Arriving" date={gettingHere.out.date}>
              <FlightList flights={gettingHere.out.flights} />
            </Leg>

            <Leg title="Leaving" date={gettingHere.home.date}>
              <FlightList flights={gettingHere.home.flights} />
            </Leg>
          </div>
        </Expander>
      </div>

      <div className="mt-4">
        <Expander
          title={otherRoutes.title}
          summary={otherRoutes.summary}
          badge={<StatusBadge status={otherRoutes.status} />}
        >
          <ul className="-mt-3">
            {otherRoutes.items.map((r) => (
              <li key={r.title} className="flex gap-3 border-t border-border py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-ink">
                  {routeIcons[r.icon]}
                </span>
                <div className="min-w-0">
                  <b className="font-semibold">{r.title}</b>
                  <p className={`mt-1 text-sm ${muted}`}>{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Expander>
      </div>

      <FlightsButton />
    </GuideSection>
  );
}
