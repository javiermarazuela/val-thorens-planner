export const trip = {
  destination: "Val Thorens",
  dates: "9–16 January 2027",
  people: 179,
  altitude: "2,300m",
  linkedPiste: "600km",
  localPiste: "150km",
  guideUpdated: "21 September 2026",
};

export type GuideStatus = "confirmed" | "partial" | "soon";

export const guideNav = [
  { slug: "schedule", title: "Schedule & theme days", group: "Plan", status: "soon" },
  { slug: "transport", title: "Transport", group: "Plan", status: "partial" },
  { slug: "faqs", title: "FAQs", group: "Plan", status: "soon" },
  { slug: "town", title: "Town & accommodation", group: "Mountain", status: "soon" },
  { slug: "mountain", title: "Ski map & mountain", group: "Mountain", status: "partial" },
  { slug: "things-to-do", title: "Things to do", group: "Off-slope", status: "soon" },
  { slug: "non-skiers", title: "Non-skiers", group: "Off-slope", status: "soon" },
  { slug: "team-games", title: "Team games", group: "Club", status: "soon" },
  { slug: "live-conditions", title: "Live conditions", group: "Club", status: "confirmed" },
] as const satisfies ReadonlyArray<{
  slug: string;
  title: string;
  group: "Plan" | "Mountain" | "Off-slope" | "Club";
  status: GuideStatus;
}>;

export type GuideSlug = (typeof guideNav)[number]["slug"];