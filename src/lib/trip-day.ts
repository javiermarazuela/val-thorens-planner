// Which day of the trip it is, by the calendar in France. Day 0 is Saturday 9 January.
const TRIP_DAYS = 8;
const START = Date.UTC(2027, 0, 9);

function franceDate(now: Date): number {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" })
    .format(now)
    .split("-")
    .map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

// 0 to 7 during the trip, otherwise null.
export function tripDayIndex(now: Date): number | null {
  const i = Math.round((franceDate(now) - START) / 86_400_000);
  return i >= 0 && i < TRIP_DAYS ? i : null;
}

// Whole days until the trip starts, or null once it has begun.
export function daysToGo(now: Date): number | null {
  const n = Math.round((START - franceDate(now)) / 86_400_000);
  return n > 0 ? n : null;
}
