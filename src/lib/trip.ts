// "preliminary" is sample data the committee has not confirmed yet. It shows a badge.
export type GuideStatus = "confirmed" | "partial" | "soon" | "preliminary";

export const trip = {
  destination: "Val Thorens",
  region: "Les 3 Vallées, France",
  dates: "9–16 January 2027",
  datesShort: "9—16 JAN 2027",
  datesMedium: "9–16 Jan 2027",
  arrival: "Saturday 9 January 2027",
  departure: "Saturday 16 January 2027",
  people: "170+",
  altitude: "2,300m",
  linkedPiste: "600km",
  localPiste: "150km",
};

// Site identity. The browser tab title, the link-preview title and the
// header wordmark all read from here — see hard rule 5 in CLAUDE.md.
// When the PWA lands in phase 4, its manifest name comes from site.name too.
// The apostrophe is U+2019, matching the rest of the copy.
const siteName = "Euro Ski ’27";

export const site = {
  name: siteName,
  // Browser tab title, on every route.
  title: siteName,
  // Link previews (WhatsApp, iMessage, Slack).
  ogTitle: siteName,
  homeOgTitle: `${siteName} — Ski Club Trip`,
  backToTopLabel: `${siteName}, back to top`,
  // Search results and link previews for the home page.
  description: `${trip.people} of us in Val Thorens from ${trip.dates}. See the week, where we stay and the essential trip guide.`,
  ogDescription: `One week, ${trip.people} people, and ${trip.linkedPiste} of linked piste.`,
};

// Page copy. Kept here rather than in the components so a later Google Sheet
// sync has one place to write to — see hard rule 5 in CLAUDE.md.
export const hero = {
  title: "Val Thorens",
  peopleSuffix: "of us",
  tagline: "A week in the world’s largest ski area.",
  imageAlt: "Val Thorens ski resort beneath the French Alps",
};

export const resortIntro = {
  title: "Why Val Thorens",
  body: "Europe’s highest ski resort puts 150km of piste at the door and 600km across Les 3 Vallées. The village is compact, mostly pedestrian and built for a group this size.",
  imageAlt: "Friends together on a snowy terrace",
};

export const mapSection = {
  title: "Maps",
  townMapTitle: "Town map",
  allLabel: "Everything",
  officialMapLabel: "See the official resort map",
  officialMapUrl: "https://www.valthorens.com/en/decouvrir/plan-station/",
  pisteMapsTitle: "Ski map",
  pisteMapImage: "/maps/val-thorens-piste-map.jpg",
  pisteMapAlt: "Val Thorens and Orelle piste map, 2025–26",
  pisteMapDownloads: [
    {
      label: "Download Val Thorens map",
      file: "/maps/Plan-Val-Thorens-Orelle-25.26-BD.pdf",
    },
    {
      label: "Download Les 3 Vallées full map",
      file: "/maps/Plan-3-Vallees-25.26-BD.pdf",
    },
  ],
  pisteMapsNote: "Official 2025–26 maps from Val Thorens. Saved here so they work without signal.",
};

export const weekSection = {
  title: "The week",
  intro: "Two travel days, six snow days in between, and something most evenings.",
};

export const faqSection = {
  title: "FAQs",
};

// The guide's sections. The page renders them in one of two orders (see
// lib/guide-order.ts): journey order before the trip starts, trip order once
// it has. A section with no component yet is skipped, so later phases only
// have to register theirs. `grade` is the piste colour and shape of its stop
// on the trail; every stop also carries its number, so colour is never the
// only signal.
export type SectionId =
  | "welcome"
  | "daily-plan"
  | "getting-here"
  | "stay"
  | "schedule"
  | "maps"
  | "around"
  | "todo"
  | "faqs"
  | "trouble"
  | "links";

export type Grade = "green" | "blue" | "red" | "black";

export const sectionMeta: Record<SectionId, { label: string; grade: Grade }> = {
  welcome: { label: "Welcome", grade: "green" },
  "daily-plan": { label: "Today’s plan", grade: "green" },
  "getting-here": { label: "Getting here & away", grade: "blue" },
  stay: { label: "Where we stay", grade: "green" },
  schedule: { label: "The week", grade: "green" },
  maps: { label: "Maps", grade: "blue" },
  around: { label: "Getting around", grade: "blue" },
  todo: { label: "Beyond the slopes", grade: "red" },
  faqs: { label: "FAQs", grade: "black" },
  trouble: { label: "In case of trouble", grade: "black" },
  links: { label: "Links & packing", grade: "black" },
};

// Before the trip: follow the journey. During it: what you need in resort first.
export const journeyOrder: SectionId[] = [
  "welcome",
  "getting-here",
  "stay",
  "schedule",
  "daily-plan",
  "maps",
  "around",
  "todo",
  "faqs",
  "trouble",
  "links",
];

export const tripOrder: SectionId[] = [
  "welcome",
  "schedule",
  "daily-plan",
  "maps",
  "around",
  "stay",
  "getting-here",
  "todo",
  "faqs",
  "trouble",
  "links",
];

// Midnight at the start of Saturday 9 January 2027 in France (CET, UTC+1).
export const tripStartsAt = "2027-01-08T23:00:00Z";

// Set to true to keep the Daily plan out of the guide until the trip starts.
export const hideDailyPlanUntilTrip = true;

export const resortFacts = [
  {
    value: trip.altitude,
    label: "Highest ski resort in Europe",
    note: "Snow that actually stays snow in January.",
  },
  {
    value: trip.linkedPiste,
    label: "Linked piste in Les 3 Vallées",
    note: "The largest linked ski area in the world.",
  },
  {
    value: trip.localPiste,
    label: "Piste in Val Thorens alone",
    note: "Enough for the week without ever leaving the valley.",
  },
  {
    value: trip.people,
    label: "Of us going",
    note: "One resort, one week, everyone within walking distance.",
  },
];

export const stay = {
  status: "partial" as GuideStatus,
  title: "Where we stay",
  name: "Résidence Village Montana",
  address: "453 Rue du Soleil, 73440 Les Belleville, France",
  directionsLabel: "Open in Google Maps",
  intro:
    "Self-catered apartments in the Plein Sud sector of Val Thorens, right by the slopes and a short walk from the lifts, the bars and each other.",
  imageAlt:
    "Résidence Village Montana’s snow-covered timber chalet buildings, with skiers passing on the piste below",
  roomsNote: "Housing signups to be released in due course.",
  // A smaller group is staying at these two. Addresses are from each place's
  // own website; the map pins are at their Google Maps positions.
  othersTitle: "Also staying",
  othersQualifier: "(small groups)",
  others: [
    {
      name: "Résidence L’Oxalys",
      type: "4-star apartment residence",
      address: "Resort entrance, 73440 Val Thorens",
      status: "partial" as GuideStatus,
    },
    {
      name: "Hôtel Le Hameau du Kashmir",
      type: "4-star hotel",
      address: "Entrée station, Grande Rue, 73440 Val Thorens",
      status: "partial" as GuideStatus,
    },
  ],
};

export type EventIcon =
  "arrivals" | "departures" | "snow" | "welcome" | "apres" | "bar" | "club" | "lastnight";

export const week: Array<{
  day: string;
  date: string;
  title: string;
  status: GuideStatus;
  daytime: { icon: EventIcon; label: string };
}> = [
  {
    day: "Sat",
    date: "9 Jan",
    title: "Arrivals",
    status: "partial",
    daytime: { icon: "arrivals", label: "Arrivals" },
  },
  {
    day: "Sun",
    date: "10 Jan",
    title: "Slope day",
    status: "partial",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Mon",
    date: "11 Jan",
    title: "Slope day",
    status: "soon",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Tue",
    date: "12 Jan",
    title: "Slope day",
    status: "soon",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Wed",
    date: "13 Jan",
    title: "Slope day",
    status: "soon",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Thu",
    date: "14 Jan",
    title: "Slope day",
    status: "soon",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Fri",
    date: "15 Jan",
    title: "Slope day",
    status: "soon",
    daytime: { icon: "snow", label: "Slope day" },
  },
  {
    day: "Sat",
    date: "16 Jan",
    title: "Departures",
    status: "partial",
    daytime: { icon: "departures", label: "Departures" },
  },
];

// What happens each day, in the same order as `week`. The evening events follow
// the committee's tracker (calendar, 7 Oct 2026). Venues, times and who each
// event is for are deliberately not shown; the coach times come from the
// committee's flights sheet and are marked TBC there.
export const dayDetailsStatus: GuideStatus = "preliminary";
export const dayDetails: Array<{
  events: Array<{ icon: EventIcon; what: string }>;
  bus: string;
  // The coach times are preliminary; the resort shuttle hours come from the resort.
  busStatus: GuideStatus;
  challenge: string;
}> = [
  {
    events: [{ icon: "welcome", what: "Welcome Drinks" }],
    bus: "Airport coaches leave Geneva at 08:30, 10:30 and 14:15 (to be confirmed)",
    busStatus: "preliminary",
    challenge: "Learn five names before dinner.",
  },
  {
    events: [{ icon: "apres", what: "Après" }],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Ride every lift on the Péclet side.",
  },
  {
    events: [
      { icon: "bar", what: "Bar Crawl" },
      { icon: "club", what: "Club Night" },
    ],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Find the best vin chaud in town.",
  },
  {
    events: [{ icon: "bar", what: "Bar Night" }],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Photo with a ski instructor.",
  },
  {
    events: [
      { icon: "apres", what: "Après" },
      { icon: "club", what: "Club Night" },
    ],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Ski one run in full costume.",
  },
  {
    events: [{ icon: "apres", what: "Après" }],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Nominate the most improved beginner.",
  },
  {
    events: [{ icon: "lastnight", what: "Last Night Drinks" }],
    bus: "Free resort shuttle, 08:00 to 20:00 (last winter’s hours)",
    busStatus: "partial",
    challenge: "Pack tonight, not at 4 a.m. (You won’t.)",
  },
  {
    events: [],
    bus: "Coaches to Geneva leave at 05:15, 07:30 and 09:30 (to be confirmed)",
    busStatus: "preliminary",
    challenge: "Sleep on the coach. Everyone else will.",
  },
];

export const mountain = {
  status: "partial" as GuideStatus,
  title: "Mountain",
  intro:
    "Beginner slopes start in town, and the whole of Les 3 Vallées connects from the same lifts.",
  linksTitle: "Live resort links",
  note: "Last lifts are mid-afternoon. Miss the link back over the ridge and you are looking at an expensive taxi round the valley — plan the last run before you take it.",
  links: [
    { label: "Ski area & piste map", href: "https://www.valthorens.com/en/ski/domaine-skiable/" },
    { label: "Snow report", href: "https://www.valthorens.com/en/infos-neige/" },
    { label: "Webcams", href: "https://www.valthorens.com/en/webcams/" },
    { label: "Weather", href: "https://www.valthorens.com/en/meteo/" },
  ],
};

export const teamGames = {
  status: "soon" as GuideStatus,
  body: "Your apartment is your team. Points are earned across the week for challenges on and off the mountain, and the rules and scoring will be published here in full. This site shows the rules only — there is no scoreboard and nothing to submit.",
};

export const packing: Array<{ group: string; items: string[] }> = [
  {
    group: "On the mountain",
    items: [
      "Ski jacket and trousers (waterproof, not a winter coat)",
      "Thermal base layers — two sets minimum",
      "Ski socks, three pairs, tall",
      "Gloves or mittens, plus a thin spare pair",
      "Goggles and sunglasses",
      "Helmet, if you own one",
      "High-factor sun cream and lip balm — it burns at 2,300m",
      "Small backpack for the hill",
    ],
  },
  {
    group: "Evenings & the apartment",
    items: [
      "Warm layers for walking between bars",
      "Proper boots with grip for icy streets",
      "Theme night outfits (themes confirmed nearer the time)",
      "Swimwear, in case of a pool or spa",
      "Reusable water bottle",
      "Painkillers, plasters, and whatever you personally need",
      "Travel adaptor for France (type E)",
    ],
  },
  {
    group: "Documents & essentials",
    items: [
      "Passport valid 6+ months after 16 Jan 2027, with 2 blank pages",
      "Travel insurance with winter sports cover",
      "GHIC or EHIC card",
      "Bank card, plus a small amount of euros as backup",
      "Booking and transfer confirmations, saved offline",
      "Phone charger and a power bank",
    ],
  },
];

// Money. SkiSync charges in euros; the site shows dollars. Euro amounts are
// the source of truth (what a Google Sheet would hold) and every dollar
// figure is derived here, so a rate change is one edit. The rate is SkiSync's
// own: their checkout shows €2,071.68 as $2,444.58, exactly 1.18. Dollar
// figures include SkiSync's non-refundable 4% card fee.
export const money = { eurToUsd: 1.18, cardFee: 0.04 };

export function usd(eur: number): string {
  const dollars = Math.round(eur * (1 + money.cardFee) * money.eurToUsd);
  return `$${dollars.toLocaleString("en-US")}`;
}

// Hard rule 1: one headline figure (the club member package, the cheapest),
// then what is and is not included. Optional add-ons show "from $X" using the
// shortest option SkiSync offers. No per-person total, no full cost table.
const memberEur = 1697;
const nonMemberEur = 1747;

export const pricing = {
  status: "confirmed" as GuideStatus,
  amountEur: memberEur,
  amountLead: "Starting from",
  amount: usd(memberEur),
  unit: "per person · club member price",
  nonMemberEur,
  nonMemberNote: `${usd(nonMemberEur)} for non-members`,
  note: "Charged in euros by SkiSync. Dollar figures are approximate and include SkiSync’s 4% card fee.",
  signupLabel: "Sign up on SkiSync",
  signupUrl:
    "https://gw.skisync.com/register?tripid=752&rep=cbssnowsports27%40gmail.com&tripName=SocialTrip",
  includesTitle: "Included",
  includes: [
    "Seven nights’ lodging",
    "Daily social event",
    "Resort taxes & fees",
    "SkiSync staff on site",
  ],
  excludesTitle: "Not included",
  excludes: [
    { label: "Lift pass", fromEur: 295 },
    { label: "Ski rental", fromEur: 120 },
    { label: "Flights" },
    { label: "Airport shuttle" },
    { label: "Travel insurance" },
  ].map((item: { label: string; fromEur?: number }) => ({
    ...item,
    price: item.fromEur === undefined ? undefined : `from ${usd(item.fromEur)}`,
  })),
};

// Deadlines from SkiSync's cancellation and transfer policy.
export const keyDates = {
  status: "confirmed" as GuideStatus,
  title: "Key dates",
  items: [
    {
      date: "10 Dec",
      label:
        "Last day to cancel your lift pass or rentals for a refund. Also check your booking: names must match your passport.",
    },
    { date: "20 Dec", label: "Fee to transfer your place rises from €75 to €225." },
    { date: "26 Dec", label: "No more transfers." },
  ],
};

export const transfers = {
  headline: "Book your own flights.",
  body: "Recommended flights coming soon.",
};

export const faqs: Array<{
  q: string;
  a: string;
  status: GuideStatus;
  // Shown on the page; the rest wait for the full guide.
  featured?: boolean;
  // Sales-era answers (cancelling, transfers). Kept here, not shown on the guide.
  archived?: boolean;
  link?: { label: string; href: string };
}> = [
  {
    q: "Which flights should I book?",
    a: "Your own — flights aren’t in the package. Aim to land on Saturday 9 January and fly home on Saturday 16 January; Geneva (GVA) is the likely airport.",
    status: "partial",
    featured: true,
  },
  {
    q: "I didn’t pre-book rental. Where do I go?",
    a: "You can rent on site from the shops in resort, but you miss SkiSync’s group discount, which walk-up rentals rarely get, and you will queue on the Sunday morning. Recommended rental shops near Village Montana are coming soon. If you can still add rentals on SkiSync, do.",
    status: "soon",
  },
  {
    q: "What time is the last lift?",
    a: "Mid-afternoon, roughly 16:15–16:45 depending on the lift. Miss the link back over the ridge from Méribel or Courchevel and it is a long, expensive taxi round the valley — start heading home by 15:30.",
    status: "partial",
  },
  {
    q: "What if I get injured?",
    a: "There is a medical centre in the village and piste rescue on the mountain. Insurance covering winter sports and mountain rescue is mandatory, not optional. Organisers are reachable all week, and the daytime programme means you are not stuck in an apartment alone.",
    status: "partial",
  },
  {
    q: "What if I don’t ski?",
    featured: true,
    a: "You are in good company — plenty of the group won't be on the mountain every day. The village is compact and pedestrian, a pedestrian lift pass gets you up to the terraces for lunch and après with everyone else, and there is tobogganing, a spa and snowshoeing on top of that.",
    status: "partial",
  },
  {
    q: "Do I need to have skied before?",
    a: "You don't need to have skied before. A good share of the group will be on skis for the first time, so you won't be the only beginner. The beginner slopes start in the village and lesson options are being arranged.",
    status: "partial",
  },
  {
    q: "Cash or card?",
    a: "Card almost everywhere. Bring around €50 in cash for the odd locker, tip or taxi that isn't.",
    status: "partial",
  },
  {
    q: "Can I bring my own skis?",
    a: "Yes. If you are renting instead, pre-booking is cheaper and faster than queueing in resort on the Sunday morning.",
    status: "partial",
  },
  {
    q: "How many days does the lift pass cover?",
    a: "Four days in a row, and rentals work the same way. You choose your first day when you register, so if you want a day off mid-week, plan it before or after your four.",
    status: "confirmed",
    featured: true,
  },
  {
    q: "Can I add a lift pass or rentals later?",
    // The early-December date is the committee's expectation, not a SkiSync
    // term, so the badge stays on until SkiSync confirms it.
    a: "You should be able to add or change extra packages, like lift passes and rentals, from your SkiSync profile until early December. We recommend doing it as soon as you can. If the online window has closed, contact SkiSync.",
    status: "preliminary",
  },
  {
    q: "Where do I collect my lift pass and rentals?",
    a: "SkiSync emails detailed check-in instructions two to three weeks before you arrive. If you are unsure once you are there, ask one of the trip leaders.",
    status: "partial",
  },
  {
    q: "My name or passport details are wrong. What do I do?",
    a: "Names must match your passport exactly, and the passport must be valid for at least six months after 16 January. SkiSync asks you to check your details at least 30 days before departure, which for us is around 10 December. Changes need written confirmation from SkiSync by email.",
    status: "partial",
  },
  {
    q: "Can I cancel?",
    archived: true,
    a: "Lodging, the social package and the deposit are non-refundable, and every cancellation carries a €75 fee. Lift passes and rentals are refundable (minus the 4% card fee) until 10 December; after that, nothing comes back.",
    status: "confirmed",
    featured: true,
    link: {
      label: "Full terms on SkiSync",
      href: "https://gw.skisync.com/register?tripid=752&rep=cbssnowsports27%40gmail.com&tripName=SocialTrip",
    },
  },
  {
    q: "Can I transfer my place?",
    archived: true,
    a: "Yes, to someone who isn’t already booked, through SkiSync. It costs €75, rising to €225 on 20 December, and transfers close on 26 December. The new person may not get the same lodging rate.",
    status: "confirmed",
    featured: true,
    link: {
      label: "Full terms on SkiSync",
      href: "https://gw.skisync.com/register?tripid=752&rep=cbssnowsports27%40gmail.com&tripName=SocialTrip",
    },
  },
  {
    q: "How much luggage can I bring?",
    a: "On the coach: one large suitcase, your ski or board gear if you’re not renting, and one small bag.",
    status: "confirmed",
  },
  {
    q: "Can I cancel or transfer my place?",
    a: "You can cancel lift passes and rentals for a refund until 10 December. Lodging, the social package and the deposit are non-refundable. You can transfer your place to someone not already booked, for €75, rising to €225 on 20 December; transfers close on 26 December and take about ten days, so start early. Everything goes through SkiSync.",
    status: "confirmed",
    link: {
      label: "Full terms on SkiSync",
      href: "https://gw.skisync.com/register?tripid=752&rep=cbssnowsports27%40gmail.com&tripName=SocialTrip",
    },
  },
];

export const contacts = {
  status: "partial" as GuideStatus,
  title: "Contact",
  // Plain text, no phone numbers, no personal emails, no WhatsApp invite
  // link on the public page — see hard rules 2 and 3 in CLAUDE.md.
  body: "Questions? Message the trip WhatsApp group.",
};

// Val Thorens sits at roughly 45.298N, 6.580E. The stay, lift and venue pins
// use real positions (OpenStreetMap, cross-checked on Google Maps); only the
// beginner carpets are still approximate. The detail card's linked title
// searches Google Maps by name, which resolves to the actual venue.
//
// The map stays inside `bounds`, the village and the slopes around the pins
// (about 3 by 5 km), [south, west] to [north, east]. MapLibre also raises the
// zoom floor on wide screens so the view never shows past the edge of the
// box. Zooms are MapLibre's, one lower than Leaflet's for the same scale.
export const mapArea = {
  bounds: [
    [45.283, 6.55],
    [45.312, 6.615],
  ] as [[number, number], [number, number]],
  minZoom: 13,
  maxZoom: 17,
  // Opening view: every pin in frame, zoomed in no further than this.
  fitMaxZoom: 15,
};

// One colour per kind, picked to stay apart under red-green and blue-yellow
// colour blindness (checked by simulation, closest pair >= 18 on the CIE Lab
// distance) and to hold white icons at 4.5:1 or better, except the two light
// kinds (lifts, restaurants), which were already pale. Après is dark teal
// rather than pink, which merged with the lift green under deuteranopia, and
// clubs are near-black slate.
export type MapKind =
  "stay" | "lift" | "restaurant" | "apres" | "bar" | "club" | "indoors" | "health";
export type MapIcon = "house" | "lift" | "fork" | "skis" | "beer" | "disco" | "wave" | "cross";

export const mapKinds: Array<{
  id: MapKind;
  label: string;
  icon: MapIcon;
  color: string;
  // Icon colour (white unless the pin is pale) and the pin's outline (white
  // unless it would vanish against the snow).
  ink?: string;
  ring?: string;
}> = [
  { id: "stay", label: "Where we stay", icon: "house", color: "#2563eb" },
  { id: "lift", label: "Lifts", icon: "lift", color: "#10b981" },
  {
    id: "restaurant",
    label: "Restaurants",
    icon: "fork",
    color: "#f29b35",
    ink: "#14232B",
    ring: "#c97a16",
  },
  { id: "apres", label: "Après", icon: "skis", color: "#0f766e" },
  { id: "bar", label: "Bars", icon: "beer", color: "#b91c1c" },
  { id: "club", label: "Clubs", icon: "disco", color: "#7c3aed" },
  {
    id: "indoors",
    label: "Indoors",
    icon: "wave",
    color: "#7dd3fc",
    ink: "#14232B",
    ring: "#0284c7",
  },
  {
    id: "health",
    label: "Medical",
    icon: "cross",
    color: "#ffffff",
    ink: "#dc2626",
    ring: "#dc2626",
  },
];

export const mapPoints: Array<{
  name: string;
  kind: MapKind;
  lat: number;
  lng: number;
  status: GuideStatus;
}> = [
  {
    // Google Maps' own pin for the residence (453 Rue du Soleil), from the
    // committee's Condos sheet. It is the Montana Premier, Valbel and Soleil
    // complex, by the Montana shuttle stop; not "Village Montana - Plein Sud",
    // a separate residence further west. The other pins are still approximate.
    name: "Résidence Village Montana",
    kind: "stay",
    lat: 45.2967123,
    lng: 6.5786458,
    status: "partial",
  },
  {
    // Google Maps' own pin, from the committee's Condos sheet.
    name: "Résidence L’Oxalys",
    kind: "stay",
    lat: 45.297788,
    lng: 6.576942,
    status: "partial",
  },
  {
    // Google Maps' own pin (Grande Rue), from the committee's Condos sheet.
    name: "Hôtel Le Hameau du Kashmir",
    kind: "stay",
    lat: 45.2988305,
    lng: 6.5763971,
    status: "partial",
  },
  // Lift pins sit on each lift's village station, taken from OpenStreetMap's
  // lift lines, so they meet the lines the map draws. Beginner carpets aren't
  // in that data and stay approximate.
  {
    name: "Funitel Péclet",
    kind: "lift",
    lat: 45.29547,
    lng: 6.57589,
    status: "partial",
  },
  {
    // The Cime Caron cable car starts outside the map, at the top of this
    // gondola; the village station is where the trip up begins.
    name: "Caron gondola (to Cime Caron)",
    kind: "lift",
    lat: 45.29428,
    lng: 6.56455,
    status: "partial",
  },
  {
    name: "Beginner carpets",
    kind: "lift",
    lat: 45.294,
    lng: 6.5804,
    status: "partial",
  },
  {
    name: "Plein Sud chair",
    kind: "lift",
    lat: 45.29519,
    lng: 6.57198,
    status: "partial",
  },
  // Venue pins below were checked against OpenStreetMap and Google Maps
  // (September 2026); they agree to within about 50 m. Saloon and Igloo de
  // Thorens are missing from OSM, so they use Google's position.
  {
    name: "La Chaumière",
    kind: "restaurant",
    lat: 45.29823,
    lng: 6.58126,
    status: "soon",
  },
  {
    name: "La Cabane",
    kind: "restaurant",
    lat: 45.30001,
    lng: 6.57862,
    status: "soon",
  },
  {
    name: "Chalet de la Marine",
    kind: "restaurant",
    lat: 45.2896,
    lng: 6.58936,
    status: "soon",
  },
  {
    name: "360 Bar",
    kind: "apres",
    lat: 45.28651,
    lng: 6.58397,
    status: "soon",
  },
  {
    name: "La Folie Douce",
    kind: "apres",
    lat: 45.30489,
    lng: 6.58811,
    status: "soon",
  },
  {
    name: "Igloo de Thorens",
    kind: "apres",
    lat: 45.29056,
    lng: 6.58277,
    status: "soon",
  },
  {
    name: "Saloon",
    kind: "bar",
    lat: 45.29741,
    lng: 6.58511,
    status: "soon",
  },
  {
    name: "Le Monde",
    kind: "bar",
    lat: 45.29694,
    lng: 6.58532,
    status: "soon",
  },
  {
    name: "The Frog and Roastbeef",
    kind: "bar",
    lat: 45.29769,
    lng: 6.58498,
    status: "soon",
  },
  {
    name: "Favela",
    kind: "bar",
    lat: 45.29727,
    lng: 6.58488,
    status: "soon",
  },
  {
    name: "Klub Summit",
    kind: "club",
    lat: 45.29689,
    lng: 6.58535,
    status: "soon",
  },
  {
    name: "Le Malaysia",
    kind: "club",
    lat: 45.29803,
    lng: 6.58167,
    status: "soon",
  },
  // Indoor places from the Things to do list. Positions are from
  // OpenStreetMap: Le Board (building), the bowling alley, and Hôtel Le Val
  // Thorens, which houses the spa.
  {
    name: "Bowling La Bicicleta",
    kind: "indoors",
    lat: 45.2985513,
    lng: 6.5815524,
    status: "partial",
  },
  {
    name: "Le Board sports centre (pools, sauna)",
    kind: "indoors",
    lat: 45.2976193,
    lng: 6.5808714,
    status: "partial",
  },
  {
    name: "Spa (Le Spa du Val Thorens)",
    kind: "indoors",
    lat: 45.2976927,
    lng: 6.5830715,
    status: "partial",
  },
  // Medical centre and pharmacy; positions from OpenStreetMap.
  {
    name: "Centre Médical de Val Thorens",
    kind: "health",
    lat: 45.2969784,
    lng: 6.5793033,
    status: "partial",
  },
  {
    name: "Pharmacie Les 3 Vallées",
    kind: "health",
    lat: 45.2973802,
    lng: 6.5846388,
    status: "partial",
  },
];

// Search by name rather than by our approximate coordinates, so the link
// lands on the real place even while the pin is still a placeholder.
export function googleMapsUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name} ${trip.destination}`,
  )}`;
}

// Privacy page copy, linked from Google's sign-in consent screen.
export const privacy = {
  title: "Privacy",
  intro: `${siteName} is run by the CBS Snow Sports committee. This is what happens to your data.`,
  points: [
    "The public page needs no account and has no tracking or ads. The only thing it records is the questions asked to Julian, described below.",
    "If you sign in with Google to reach the members area, we receive your name and email address from Google. That is all. We don't see your Google password or anything else in your account.",
    "We use your email only to check you're a Columbia student or an approved guest, and to show you the members area. We don't share it, sell it or use it for marketing.",
    "If you fill in the flight details form, we store what you enter, along with your name, and the committee keeps it in a private spreadsheet so it can organise transfers. To find your flight we send the flight number and date, nothing about you, to an airline data service.",
    'Other signed-in members can see your name next to your flight, and who is on the same flight or airport coach. Untick "Show me to other members" on the Crew page to hide yourself. Your email, room and everything else stay private.',
    "Your checklist on the page is saved on your own device, not on our servers.",
    "If you ask Julian the snowman a question, we keep the question text (cut to 300 characters) in a log with no name, email or account attached, so the committee can see what to add to the guide. Please don't put personal details in your questions. When you're signed in and the guide has no ready answer, your question is also sent to Anthropic, the AI provider behind Julian, to write a reply. To enforce the daily limits and the 24-hour off-topic pause, we also keep, against your account, how many AI answers you have had each day and your current off-topic count. None of the question text is stored there.",
    "Want your data removed? Ask in the trip WhatsApp group and the committee will delete it.",
  ],
};

// Getting here & away. Flights are from the committee's flights sheet. Coach
// times are marked TBC there, so they stay preliminary; the sheet notes the
// coach ride is about 3.5 hours.
export type Flight = {
  airline: string;
  number: string;
  route: string;
  dep: string;
  arr: string;
  nonstop: boolean;
  // Lands the morning after leaving (overnight flights to Geneva).
  nextDay?: boolean;
};

export const gettingHere = {
  title: "Getting here & away",
  intro: "Read this before you fly, and again on the last morning.",
  airport: { label: "Airport", value: "Geneva (GVA)" },
  arrive: { label: "Arrive", value: "Sat 9 Jan" },
  leave: { label: "Leave", value: "Sat 16 Jan" },
  flightsNote:
    "Flights are not in the package, so book your own. These are the options we are suggesting.",
  nonstopLabel: "Non-stop",
  oneStopLabel: "1 stop",
  showMore: (n: number) => `Show ${n} more`,
  showFewer: "Show fewer",
  noCoach: "No group coach",
  recommended: {
    title: "Recommended flights",
    summary: "Arrive in Geneva on Sat 9 Jan morning, leave on Sat 16 Jan morning",
  },
  out: {
    title: "To Geneva",
    date: "Fri 8 – Sat 9 Jan",
    flights: [
      {
        airline: "United",
        number: "UA956",
        route: "EWR → GVA",
        dep: "17:35",
        arr: "07:25",
        nonstop: true,
        nextDay: true,
      },
      {
        airline: "United / Swiss",
        number: "LX23 / UA9719",
        route: "JFK → GVA",
        dep: "19:35",
        arr: "09:20",
        nonstop: true,
        nextDay: true,
      },
      {
        airline: "Swiss",
        number: "LX17 + LX2802",
        route: "JFK → ZRH → GVA",
        dep: "16:25",
        arr: "08:24",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "Delta",
        number: "DL9357 / KL642 + DL9618 / KL1929",
        route: "JFK → AMS → GVA",
        dep: "17:00",
        arr: "08:20",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "United",
        number: "UA8187 / AC8641 + UA8390 / AC802",
        route: "LGA → YUL → GVA",
        dep: "17:35",
        arr: "10:00",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "Air Canada",
        number: "AC8641 + AC802",
        route: "LGA → YUL → GVA",
        dep: "17:35",
        arr: "10:00",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "British Airways",
        number: "BA116 + BA730",
        route: "JFK → LHR → GVA",
        dep: "20:05",
        arr: "12:40",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "Swiss",
        number: "LX15 + LX2824",
        route: "JFK → ZRH → GVA",
        dep: "21:00",
        arr: "12:55",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "Swiss",
        number: "LX19 + LX2806",
        route: "EWR → ZRH → GVA",
        dep: "22:00",
        arr: "13:45",
        nonstop: false,
        nextDay: true,
      },
      {
        airline: "British Airways",
        number: "BA114 + BA732",
        route: "JFK → LHR → GVA",
        dep: "21:40",
        arr: "13:50",
        nonstop: false,
        nextDay: true,
      },
    ] as Flight[],
  },
  home: {
    title: "Back to New York",
    date: "Sat 16 Jan",
    flights: [
      {
        airline: "United",
        number: "UA957",
        route: "GVA → EWR",
        dep: "09:15",
        arr: "12:30",
        nonstop: true,
      },
      {
        airline: "Swiss / United",
        number: "LX22 / UA9720",
        route: "GVA → JFK",
        dep: "11:35",
        arr: "14:35",
        nonstop: true,
      },
      {
        airline: "United",
        number: "LH1213 / UA961",
        route: "GVA → FRA → EWR",
        dep: "08:45",
        arr: "13:55",
        nonstop: false,
      },
      {
        airline: "American",
        number: "BA725 / BA189",
        route: "GVA → LHR → EWR",
        dep: "08:55",
        arr: "15:35",
        nonstop: false,
      },
      {
        airline: "Aer Lingus",
        number: "EI681 / EI101",
        route: "GVA → DUB → EWR",
        dep: "10:30",
        arr: "16:15",
        nonstop: false,
      },
      {
        airline: "Delta",
        number: "KL1932 + KL641",
        route: "GVA → AMS → JFK",
        dep: "12:05",
        arr: "17:22",
        nonstop: false,
      },
      {
        airline: "British Airways / American",
        number: "BA731 / BA179",
        route: "GVA → LHR → JFK",
        dep: "13:35",
        arr: "19:50",
        nonstop: false,
      },
      {
        airline: "British Airways",
        number: "BA731 / BA179",
        route: "GVA → LHR → JFK",
        dep: "14:05",
        arr: "19:50",
        nonstop: false,
      },
      {
        airline: "Delta",
        number: "AF1443 + AF008",
        route: "GVA → CDG → JFK",
        dep: "14:35",
        arr: "19:20",
        nonstop: false,
      },
      {
        airline: "British Airways",
        number: "BA733 / BA179",
        route: "GVA → LHR → JFK",
        dep: "14:40",
        arr: "19:50",
        nonstop: false,
      },
      {
        airline: "British Airways / American",
        number: "BA737 / BA183",
        route: "GVA → LHR → JFK",
        dep: "16:20",
        arr: "22:25",
        nonstop: false,
      },
      {
        airline: "British Airways / American",
        number: "BA739 / BA183",
        route: "GVA → LHR → JFK",
        dep: "17:15",
        arr: "22:25",
        nonstop: false,
      },
    ] as Flight[],
  },
};

// Flights the committee has typed in by hand for the members' flight form.
// They show as chips and are matched on the spot, so they never cost an API
// call. Add one per flight, for example:
//   { direction: "arrival", date: "2027-01-09", number: "LX2802", airline: "Swiss",
//     from: "ZRH", to: "GVA", time: "08:24" }
// `date` is the day the flight lands (arrival) or leaves (departure); `time` is
// the local time at the airport you land at or leave from. Preliminary until
// the committee confirms them.
export type KnownFlight = {
  direction: "arrival" | "departure";
  date: string;
  number: string;
  airline: string;
  from: string;
  to: string;
  time: string;
};

export const knownFlights: KnownFlight[] = [];

export const airportCoaches = {
  status: "preliminary" as GuideStatus,
  title: "Airport coaches",
  intro:
    "Times are still to be confirmed. The ride is about 3.5 hours, and the meeting point will go here once it is set.",
  out: { title: "Geneva to Val Thorens", times: ["08:30", "10:30", "14:15"] },
  home: {
    title: "Val Thorens to Geneva",
    // `flightsFrom` is the earliest flight each coach suits, so you reach the
    // airport in time: allow at least 5 hours before departure, 6 is better.
    coaches: [
      { time: "05:15", flightsFrom: "10:00" },
      { time: "07:30", flightsFrom: "12:00" },
      { time: "09:30", flightsFrom: "14:00" },
    ],
  },
  returnNote: "Allow at least 5 hours between leaving the resort and your flight. 6 is better.",
};

export const checkSteps = {
  title: "Check-in and check-out",
  status: "soon" as GuideStatus,
  items: [
    {
      n: "01",
      h: "Check-in",
      p: "Saturday 9 January at Résidence Village Montana. Times and key pick-up are still to be confirmed.",
    },
    {
      n: "02",
      h: "Check-out",
      p: "Saturday 16 January. Times, and how to hand back the keys, are still to be confirmed.",
    },
  ],
};

export type OtherRouteIcon = "bus" | "train" | "calendar";

export const otherRoutes = {
  // Partly confirmed, so it shows without a badge.
  status: "partial" as GuideStatus,
  title: "Other ways to get there",
  summary: "Lyon, Paris by train, or Geneva on your own",
  items: [
    {
      icon: "bus" as OtherRouteIcon,
      title: "Fly to Lyon or Chambéry, then bus",
      body: "Chambéry (CMF) is the closest airport, about 90 minutes away, with fewer flights. Lyon (LYS) is another option. Either way, it is a bus or shuttle up the valley.",
    },
    {
      icon: "train" as OtherRouteIcon,
      title: "Train from Paris",
      body: "Fly to Paris, take the TGV to Moûtiers (the station at the foot of the valley, about 45 minutes away), then a bus or taxi up.",
    },
    {
      icon: "calendar" as OtherRouteIcon,
      title: "Geneva on your own time",
      body: "For flights that miss the coaches. A shared transfer or taxi works, and sharing is cheaper.",
    },
  ],
};

// Getting around. Everything here is the resort's free shuttle as published
// for winter 2025–26 (timetable, stop map and the list of which stop serves
// which hotel); the 2026–27 one is not out yet, so the page says so. The line
// geometry is in `shuttle-route.ts`. Stop positions are OpenStreetMap's, which
// agree with the resort's stop map.
export const gettingAround = {
  status: "partial" as GuideStatus,
  title: "Getting around",
  tiles: {
    home: {
      title: "Back to the chalet",
    },
    late: {
      title: "Late at night",
      body: "Last bus around 20:00 (22:00 on Saturday). After that, walk or book a taxi (pre-booking is mandatory).",
    },
    valley: {
      title: "Other villages",
      body: "A separate free bus from the bus station to Les Menuires and Saint-Martin, about hourly. Not on Saturdays.",
    },
  },
  shuttle: {
    title: "Free resort shuttle",
    seasonNote:
      "Last winter’s timetable and stops (22 November 2025 to 3 May 2026). 2026–27 to follow.",
    hours: [
      { days: "Sunday to Friday", times: "08:00 – 20:00" },
      { days: "Saturday", times: "06:15 – 22:00" },
    ],
    frequency: "Every 20 minutes, and every 10 minutes Sunday to Friday in peak season.",
    // One bus drives a figure of eight through the bus station: the west loop
    // first, then the east loop, about 20 minutes in all.
    hub: { name: "Bus station", note: "Place des Arolles", lat: 45.29799, lng: 6.57986 },
    loops: [
      {
        id: "west" as const,
        name: "West loop",
        note: "Rue du Soleil side. Our side of town.",
        color: "#d97706",
        stops: [
          { name: "Les Montagnettes", lat: 45.29656, lng: 6.58044 },
          { name: "Montana", lat: 45.29678, lng: 6.5791 },
          { name: "Les Temples du Soleil", lat: 45.29697, lng: 6.5775 },
          { name: "P2", lat: 45.29799, lng: 6.57611 },
          { name: "Cairn", lat: 45.29869, lng: 6.57792 },
          { name: "Les Arolles", lat: 45.298, lng: 6.57885 },
        ],
      },
      {
        id: "east" as const,
        name: "East loop",
        note: "Through the centre and up to Les Balcons.",
        color: "#0f766e",
        stops: [
          { name: "Maison de Val Thorens", lat: 45.29859, lng: 6.582 },
          { name: "Église", lat: 45.29808, lng: 6.58343 },
          { name: "Place Péclet", lat: 45.29663, lng: 6.58426 },
          { name: "Les Névés", lat: 45.29777, lng: 6.58474 },
          { name: "P0", lat: 45.29919, lng: 6.5831 },
          { name: "Les Balcons", lat: 45.29992, lng: 6.57917 },
        ],
      },
    ],
    // Which stop the resort's brochure lists each of our places under. `pin` is
    // the place's name in `mapPoints`, which holds its position.
    stays: [
      { name: "Village Montana", pin: "Résidence Village Montana", stop: "Montana" },
      { name: "L’Oxalys", pin: "Résidence L’Oxalys", stop: "Cairn" },
      { name: "Hameau du Kashmir", pin: "Hôtel Le Hameau du Kashmir", stop: "Cairn" },
    ],
    // Our places have no stop of their own; the shuttle has none named Kashmir.
    stayNote: "Dotted lines show the walk from each place to its stop.",
    link: {
      label: "Official shuttle page",
      href: "https://www.valthorens.com/en/sejour/infos-pratiques/navettes-gratuites/",
    },
  },
  valley: {
    title: "Belleville valley bus",
    body: "Free to Les Menuires (about 20 minutes) and Saint-Martin-de-Belleville (about 40), roughly hourly from 08:30 to 19:00. Sunday to Friday only.",
    mapLabel: "Valley bus to Les Menuires and Saint-Martin",
    mapNote: "Not on Saturdays",
  },
};

// Things to do. The venue cards come from `mapPoints`, so the map and this list
// never disagree; the committee's own picks will be added as they are made.
export type ActivityGroup = "thrills" | "views" | "indoors";

export const activityGroups: Array<{ id: ActivityGroup; label: string }> = [
  { id: "thrills", label: "Thrills" },
  { id: "views", label: "Top views" },
  { id: "indoors", label: "Indoors" },
];

// Things to do that are not a venue on the map. Each one links to the resort's
// own page (or its booking page).
export const activities: Array<{ name: string; group: ActivityGroup; url: string }> = [
  {
    name: "Cosmojet toboggan run",
    group: "thrills",
    url: "https://www.valthorens.com/en/activites/luge-cosmojet/",
  },
  {
    name: "Snowmobiling",
    group: "thrills",
    url: "https://www.valthorens.com/en/activites/motoneige/",
  },
  {
    name: "Ice karting",
    group: "thrills",
    url: "https://www.valthorens.com/en/?p=443",
  },
  {
    name: "Mountain Kart Xperience",
    group: "thrills",
    url: "https://www.valthorens.com/en/mountain-kart-xperience/",
  },
  {
    name: "Snowtubing (Moon Xperience)",
    group: "thrills",
    url: "https://www.valthorens.com/en/activites/snowtubing-moon-xperience/",
  },
  {
    name: "Electric fat biking",
    group: "thrills",
    url: "https://booking.valthorens.com/aesf-afatbikenocturne/electric-fat-bike-evening-ride.html",
  },
  {
    name: "Helicopter discovery flight",
    group: "views",
    url: "https://www.valthorens.com/en/activites/helicoptere/",
  },
  {
    name: "Paramotor / Snow Trike flight",
    group: "views",
    url: "https://www.valthorens.com/en/activites/paramoteur-snow-trike/",
  },
  {
    name: "Snow groomer ride + Savoyard aperitif",
    group: "views",
    url: "https://www.valthorens.com/en/?p=455",
  },
  {
    name: "Dog sledding",
    group: "views",
    url: "https://www.valthorens.com/en/activites/chiens-traineaux/",
  },
  {
    name: "Snowshoeing",
    group: "views",
    url: "https://www.valthorens.com/en/activites/raquettes/",
  },
  {
    name: "Pedestrian lift pass",
    group: "views",
    url: "https://www.valthorens.com/en/activites/sentiers-pietons/forfait-pieton/",
  },
  {
    name: "Bowling La Bicicleta",
    group: "indoors",
    url: "https://www.valthorens.com/en/equipement/bowling-de-val-thorens-la-bicicleta/",
  },
  {
    name: "Le Board sports centre (pools, sauna)",
    group: "indoors",
    url: "https://www.valthorens.com/en/equipement/centre-sportif-le-board/",
  },
  {
    name: "Spa (Le Spa du Val Thorens)",
    group: "indoors",
    url: "https://www.valthorens.com/en/equipement/le-spa-du-val-thorens/",
  },
];

// Things to do. The venue cards come from `mapPoints`, so the map and this list
// never disagree; the activity cards come from `activities`.
export const thingsToDo = {
  title: "Beyond the slopes",
  intro:
    "Where to eat on the mountain and in town, where to go after, and what to do when your legs say no.",
  filters: [
    { id: "all", label: "Everything" },
    { id: "eat", label: "Restaurants", kinds: ["restaurant"] },
    { id: "apres", label: "Après", kinds: ["apres"] },
    { id: "bars", label: "Bars", kinds: ["bar"] },
    { id: "late", label: "Clubs", kinds: ["club"] },
    ...activityGroups.map((g) => ({ id: g.id, label: g.label })),
  ] as Array<{ id: string; label: string; kinds?: MapKind[] }>,
  moreLabel: "More things to do on the resort site",
  moreUrl: "https://www.valthorens.com/en/que-faire-a-val-thorens-quand-on-ne-skie-pas/",
};

// In case of trouble. 112 is the EU emergency number. The medical centre and
// pharmacy are from the resort's own listings; hours can change in season, so
// the resort page is linked.
export const trouble = {
  title: "In case of trouble",
  emergency: {
    label: "Emergency · tap to call",
    number: "112",
    href: "tel:112",
    note: "Works from any phone in Europe.",
  },
  doctor: {
    label: "Medical centre",
    name: "Centre Médical de Val Thorens",
    address: "Rue du Slalom, Quartier Slalom",
    body: "General medicine and sports injuries, with x-ray. Usually open Monday to Friday 10:00–12:30 and 15:00–19:00, Saturday 10:00–12:30. Hours can change, so check the resort page.",
    href: "https://www.valthorens.com/en/commerce-service/centre-medical-de-val-thorens/",
    linkLabel: "Resort page",
  },
  pharmacy: {
    label: "Pharmacy",
    name: "Pharmacie Les 3 Vallées",
    address: "Galerie Péclet, Quartier Grande Rue",
    body: "In the Péclet shopping centre at the top of the resort.",
    href: "https://www.valthorens.com/en/commerce-service/pharmacie-les-3-vallees/",
    linkLabel: "Resort page",
  },
  insurance:
    "Insurance covering winter sports and mountain rescue is mandatory, so keep your policy details on your phone.",
};

export const linksSection = {
  title: "Links & packing",
  linksTitle: "Useful links",
  officialSite: { label: "Val Thorens official site", href: "https://www.valthorens.com/en/" },
  packingTitle: "Packing list",
};
