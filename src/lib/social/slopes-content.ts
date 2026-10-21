import { week } from "@/lib/trip";

// The choices on the slope plan. Short on purpose: three taps and done. The
// places and times are preliminary until the committee confirms them.

export const slopesStatus = "preliminary" as const;

export const slopeTimes = ["09:00", "10:00", "11:30", "13:30", "14:30"];
export const defaultSlopeTime = "10:00";

export const slopePlaces = [
  "Rond-Point des Pistes",
  "Cime Caron",
  "Péclet glacier",
  "Plein Sud",
  "3 Vallées (Méribel side)",
];
export const defaultSlopePlace = "Rond-Point des Pistes";

export type SlopeLevel = "beginner" | "easy" | "medium" | "advanced" | "expert";

export const slopeLevels: Array<{ id: SlopeLevel; label: string }> = [
  { id: "beginner", label: "Beginner" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "advanced", label: "Advanced" },
  { id: "expert", label: "Expert" },
];
export const defaultSlopeLevel: SlopeLevel = "medium";

export const levelLabel = (id: string) => slopeLevels.find((l) => l.id === id)?.label ?? id;

export type SlopeDay = { iso: string; label: string };

/** The slope days of the week plan, as yyyy-mm-dd plus a short label. */
export const slopeDays: SlopeDay[] = week
  .filter((d) => d.daytime.label === "Slope day")
  .map((d) => {
    const dayOfMonth = Number(d.date.split(" ")[0]);
    return {
      iso: `2027-01-${String(dayOfMonth).padStart(2, "0")}`,
      label: `${d.day} ${dayOfMonth}`,
    };
  });

// "Now", with the test site's pretend clock when it is switched on.
export function slopesNow(): Date {
  const fake = (window as unknown as { __euroSkiNow?: () => Date }).__euroSkiNow;
  try {
    return fake ? fake() : new Date();
  } catch {
    return new Date();
  }
}

const parisParts = (now: Date) => {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(f.formatToParts(now).map((x) => [x.type, x.value]));
  return {
    iso: `${p["year"]}-${p["month"]}-${p["day"]}`,
    minutes: (Number(p["hour"]) % 24) * 60 + Number(p["minute"]),
  };
};

/** Today's date in France as yyyy-mm-dd. */
export const franceToday = (now: Date) => parisParts(now).iso;

/** Minutes since midnight in France. */
export const franceMinutes = (now: Date) => parisParts(now).minutes;

/** The day the slopes tab opens on: today if it is a slope day, else the first one. */
export function initialSlopeDay(now: Date): string {
  const today = franceToday(now);
  return slopeDays.some((d) => d.iso === today) ? today : (slopeDays[0]?.iso ?? today);
}
