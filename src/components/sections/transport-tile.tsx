import { useEffect, useState } from "react";
import { Bus, Plane } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { pickEnvironment, type ChatEnvironment } from "@/lib/chat/environment";
import type { ChatProfile, LegInfo } from "@/lib/chat/types";
import { appNow } from "@/lib/now";
import { gettingAround } from "@/lib/trip";
import { tripDayIndex } from "@/lib/trip-day";

const label = "text-xs font-medium uppercase tracking-wider text-muted-foreground";

// The shuttle's hours are last winter's. Day 0 and day 7 are Saturdays.
const SATURDAY = { open: 6 * 60 + 15, close: 22 * 60, every: "every 20 minutes" };
const WEEKDAY = { open: 8 * 60, close: 20 * 60, every: "every 10 to 20 minutes" };

function hours(day: number) {
  return day === 0 || day === 7 ? SATURDAY : WEEKDAY;
}

const pad = (n: number) => String(n).padStart(2, "0");
const clock = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

// Minutes since midnight in Val Thorens, so the countdown is right whatever the
// device's own time zone is.
function minutesNow(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

function inWords(mins: number): string {
  if (mins < 1) return "less than a minute";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// The shuttle stop for the person's place, from `gettingAround.shuttle.stays`.
function stopFor(profile: ChatProfile | null): string | null {
  const residence = profile?.room?.residence;
  if (!residence) return null;
  return gettingAround.shuttle.stays.find((s) => residence.includes(s.name))?.stop ?? null;
}

// "Sat 9 Jan, 08:30" -> minutes since midnight.
function coachMinutes(when: string | null): number | null {
  const m = when?.match(/(\d{1,2}):(\d{2})\s*$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function coachLeg(profile: ChatProfile | null, day: number): LegInfo | null {
  const leg = day === 0 ? profile?.arrival : day === 7 ? profile?.departure : null;
  return leg?.coachName && leg.coachWhen ? leg : null;
}

// One tile for getting about. On the first and last day, if the person has an
// airport coach, it is their coach and the time left. Every other day, and for
// anyone without a coach, it is the resort shuttle: the stop for their place,
// how often it runs and when the last bus goes. It never claims a bus time to
// the minute, because we only know the hours and the frequency.
export function TransportTile({ day }: { day: number }) {
  const [env, setEnv] = useState<ChatEnvironment | null>(null);
  useEffect(() => setEnv(pickEnvironment()), []);
  return env ? <WithIdentity env={env} day={day} /> : <TileFrame day={day} profile={null} />;
}

function WithIdentity({ env, day }: { env: ChatEnvironment; day: number }) {
  const identity = env.useIdentity();
  return <TileFrame day={day} profile={identity.profile} />;
}

function TileFrame({ day, profile }: { day: number; profile: ChatProfile | null }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(appNow());
    const id = window.setInterval(() => setNow(appNow()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const isToday = now !== null && tripDayIndex(now) === day;
  const mins = now ? minutesNow(now) : 0;
  const leg = coachLeg(profile, day);

  if (leg) {
    const at = coachMinutes(leg.coachWhen);
    let status = leg.coachWhen ?? "";
    if (isToday && at !== null) {
      status =
        mins < at
          ? `Leaves at ${clock(at)}, in ${inWords(at - mins)}`
          : `Left at ${clock(at)}. If you missed it, message the trip WhatsApp group.`;
    }
    return (
      <div className="rounded-2xl bg-mint p-4">
        <div className="flex items-center justify-between gap-2">
          <p className={label}>{day === 0 ? "Your coach in" : "Your coach home"}</p>
          <StatusBadge status="preliminary" />
        </div>
        <p className="mt-2 flex items-center gap-2.5 text-base font-semibold leading-snug">
          <Plane className="size-6 shrink-0 text-primary" aria-hidden="true" />
          <span>{leg.coachName}</span>
        </p>
        <p className="mt-1 text-sm">{status}</p>
        {leg.pickup && <p className="mt-1 text-sm text-muted-foreground">Meet: {leg.pickup}</p>}
      </div>
    );
  }

  const h = hours(day);
  const stop = stopFor(profile);
  let headline = `A bus ${h.every}`;
  let detail = `Runs ${clock(h.open)} to ${clock(h.close)}.`;
  if (isToday) {
    if (mins < h.open) {
      headline = `First bus at ${clock(h.open)}`;
      detail = `In ${inWords(h.open - mins)}, then ${h.every}.`;
    } else if (mins < h.close) {
      headline = `A bus ${h.every}`;
      detail = `Last bus at ${clock(h.close)}, in ${inWords(h.close - mins)}.`;
    } else {
      headline = "The last bus has gone";
      detail = "Walk, or book a taxi ahead.";
    }
  }

  return (
    <div className="rounded-2xl bg-mint p-4">
      <div className="flex items-center justify-between gap-2">
        <p className={label}>{stop ? `Resort shuttle · ${stop} stop` : "Resort shuttle"}</p>
        <StatusBadge status="preliminary" />
      </div>
      <p className="mt-2 flex items-center gap-2.5 text-base font-semibold leading-snug">
        <Bus className="size-6 shrink-0 text-primary" aria-hidden="true" />
        <span>{headline}</span>
      </p>
      <p className="mt-1 text-sm">{detail}</p>
      {!stop && profile === null && (
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to see the stop for your place.
        </p>
      )}
    </div>
  );
}
