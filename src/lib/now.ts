// "Now" for anything that depends on the date. The real site always returns the
// real time. The test site sets window.__euroSkiNow so the whole guide and the
// chatbot can be tried on any day of the trip.
declare global {
  interface Window {
    __euroSkiNow?: () => Date;
  }
}

export function appNow(): Date {
  if (typeof window !== "undefined" && window.__euroSkiNow) {
    try {
      return window.__euroSkiNow();
    } catch {
      // Fall through to the real time.
    }
  }
  return new Date();
}
