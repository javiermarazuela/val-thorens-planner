import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { guideNav, trip, type GuideSlug, type GuideStatus } from "./trip";

type GuideSection = {
  slug: GuideSlug;
  title: string;
  eyebrow: string;
  summary: string;
  status: GuideStatus;
  known: string[];
  forthcoming: string[];
  links?: { label: string; href: string }[];
  note?: string;
  updated: string;
};

// This is the dormant protection boundary. A shared-password session check can
// be added here later without moving guide content or changing guide routes.
async function requireGuideAccess() {
  const gateEnabled = false;
  if (!gateEnabled) return;
}

const sections: Record<GuideSlug, GuideSection> = {
  schedule: {
    slug: "schedule", title: "Schedule & theme days", eyebrow: "Plan your week",
    summary: "The day-by-day plan will live here, including every theme day.", status: "soon",
    known: ["Arrival: Saturday 9 January 2027", "Departure: Saturday 16 January 2027"],
    forthcoming: ["Daily meeting points and timings", "Theme days", "Evening programme"], updated: trip.guideUpdated,
  },
  transport: {
    slug: "transport", title: "Transport", eyebrow: "There and back again",
    summary: "Airport choices, both group transfers and the simple ways to move around resort.", status: "partial",
    known: ["Geneva and Lyon are roughly three hours away", "Chambéry is roughly two hours away", "Val Thorens is compact, largely pedestrian and mostly ski-in ski-out"],
    forthcoming: ["Suggested flights", "Outbound transfer times", "Return transfer times"], updated: trip.guideUpdated,
  },
  faqs: {
    slug: "faqs", title: "FAQs", eyebrow: "The useful leftovers",
    summary: "Short answers that do not belong more naturally in Transport, Mountain or Going out.", status: "soon",
    known: ["Topic-specific answers will sit on the page where you need them"],
    forthcoming: ["Check-in and check-out details", "What to pack", "Who to contact and when"], updated: trip.guideUpdated,
  },
  town: {
    slug: "town", title: "Town & accommodation", eyebrow: "Find your bearings",
    summary: "Accommodation, useful landmarks and the fastest routes through town.", status: "soon",
    known: ["Val Thorens is compact and largely pedestrian", "Most accommodation is ski-in ski-out"],
    forthcoming: ["Accommodation names and locations", "Town map", "Chalet meeting points"], updated: trip.guideUpdated,
  },
  mountain: {
    slug: "mountain", title: "Ski map & mountain", eyebrow: "On the snow",
    summary: "The piste map, mountain essentials and fallback rental information.", status: "partial",
    known: ["150km of piste in Val Thorens", "600km linked across Les 3 Vallées", "Europe’s highest ski resort at 2,300m"],
    forthcoming: ["Official 2026/27 piste map", "Gear rental for anyone who did not pre-book", "First-morning mountain access"], updated: trip.guideUpdated,
  },
  "things-to-do": {
    slug: "things-to-do", title: "Things to do", eyebrow: "Eat, drink, explore",
    summary: "Recommendations for lunch, dinner, après and time away from the slopes.", status: "soon",
    known: ["Recommendations will be grouped by lunch, dinner, après and activities"],
    forthcoming: ["Restaurant shortlist", "Après meeting points", "Clubs and the journey home", "Bookable activities"], updated: trip.guideUpdated,
  },
  "non-skiers": {
    slug: "non-skiers", title: "Non-skiers", eyebrow: "A full week off the pistes",
    summary: "A proper daytime programme whether you are not skiing by choice, injury, rest day or hangover.", status: "soon",
    known: ["There will be organised daytime options throughout the week", "The programme is for everyone, including skiers taking a day off"],
    forthcoming: ["Daily activities", "Meeting places and timings", "Costs and booking requirements"], updated: trip.guideUpdated,
  },
  "team-games": {
    slug: "team-games", title: "Team games", eyebrow: "Chalet versus chalet",
    summary: "The rules and points system for the week-long chalet competition.", status: "soon",
    known: ["Teams are based on chalets", "This version displays rules and scoring only", "There will be no public scoreboard or submissions"],
    forthcoming: ["Full rules", "Challenges", "Points values"], updated: trip.guideUpdated,
  },
  "live-conditions": {
    slug: "live-conditions", title: "Live conditions", eyebrow: "Check before you leave",
    summary: "Official sources for webcams, snow, pistes and weather.", status: "confirmed",
    known: ["These links lead to live information maintained by the resort"], forthcoming: [],
    links: [
      { label: "Val Thorens webcams", href: "https://www.valthorens.com/en/webcams/" },
      { label: "Snow report", href: "https://www.valthorens.com/en/ski/snow-report/" },
      { label: "Weather", href: "https://www.valthorens.com/en/weather/" },
      { label: "Piste information", href: "https://www.valthorens.com/en/ski/ski-area/" },
    ], note: "External pages may change before January; links will be checked again before departure.", updated: trip.guideUpdated,
  },
};

export const getGuideOverview = createServerFn({ method: "GET" }).handler(async () => {
  await requireGuideAccess();
  return { updated: trip.guideUpdated, areas: guideNav };
});

export const getGuideSection = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    await requireGuideAccess();
    const section = sections[data.slug as GuideSlug];
    return section ?? null;
  });