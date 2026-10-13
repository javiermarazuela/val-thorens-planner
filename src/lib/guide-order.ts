import {
  hideDailyPlanUntilTrip,
  journeyOrder,
  sectionMeta,
  tripOrder,
  tripStartsAt,
  type SectionId,
} from "@/lib/trip";

export type GuideOrder = "journey" | "trip";

// `override` is the ?order= query, used to look at either order before the trip.
export function pickOrder(now: Date, override?: GuideOrder): GuideOrder {
  if (override) return override;
  return now.getTime() >= new Date(tripStartsAt).getTime() ? "trip" : "journey";
}

// Sections in page order, skipping any that have no component yet.
export function sectionsFor(
  order: GuideOrder,
  available: ReadonlySet<SectionId>,
  now: Date = new Date(),
): SectionId[] {
  const started = now.getTime() >= new Date(tripStartsAt).getTime();
  // Once the trip has started the Daily plan (today, with a day picker) replaces
  // The week, so the guide doesn't show the same days twice.
  return (order === "trip" ? tripOrder : journeyOrder).filter(
    (id) =>
      available.has(id) &&
      !(id === "daily-plan" && hideDailyPlanUntilTrip && !started) &&
      !(id === "schedule" && started),
  );
}

export type Stop = { id: SectionId; label: string; n: string };

// One stop per section on the trail, numbered in page order.
export function stopsFor(ids: readonly SectionId[]): Stop[] {
  return ids.map((id, i) => ({
    id,
    label: sectionMeta[id].label,
    n: String(i + 1).padStart(2, "0"),
  }));
}
