import { TEST_NOW_KEY } from "@/lib/test-persona-keys";

// Test site only: a frozen "now" so the guide and the chatbot can be tried on
// any day of the trip. It is on by default (Sat 9 Jan 2027, 09:00 in Val
// Thorens) and the date picker in the Test site tag changes it. Loading this
// file installs window.__euroSkiNow, which appNow() in lib/now.ts picks up.

export const DEFAULT_TEST_NOW = "2027-01-09T09:00";

function onTestHost(): boolean {
  const host = window.location.hostname;
  return host.startsWith("test.") || host === "localhost";
}

/** The chosen time as the "yyyy-mm-ddThh:mm" a date picker uses, in Val Thorens time. */
export function getTestNowLocal(): string {
  try {
    return window.localStorage.getItem(TEST_NOW_KEY) || DEFAULT_TEST_NOW;
  } catch {
    return DEFAULT_TEST_NOW;
  }
}

/** Save a new time (or null for "real time" via the default) and reload. */
export function setTestNowLocal(value: string | null) {
  try {
    if (value) window.localStorage.setItem(TEST_NOW_KEY, value);
    else window.localStorage.removeItem(TEST_NOW_KEY);
  } catch {
    // Without storage the time just stays at the default.
  }
  window.location.reload();
}

if (typeof window !== "undefined" && onTestHost()) {
  // January is always UTC+1 in France, which covers every date in this trip.
  window.__euroSkiNow = () => new Date(`${getTestNowLocal()}:00+01:00`);
}
