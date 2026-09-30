export type GuideStatus = "confirmed" | "partial" | "soon";

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
  description: `${trip.people} of us in Val Thorens from ${trip.dates}. See the week, accommodation, price and essential trip guide.`,
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
  title: "Map",
  allLabel: "Everything",
  hint: "Tap a pin for what it is, and a link straight to it in Google Maps.",
  openInMaps: "Open in Google Maps",
  approxNote:
    "Pin positions are approximate until the committee confirms them. Each place’s name opens its real location in Google Maps.",
  officialMapLabel: "See the official resort map",
  officialMapUrl: "https://www.valthorens.com/en/decouvrir/plan-station/",
};

export const weekSection = {
  title: "The week",
  intro: "Two travel days, six full days in between. Theme details will appear as they are agreed.",
};

export const guide = {
  summaryLabel: "See the guide",
  packingLabel: "Open packing list",
};

export const faqSection = {
  title: "FAQs",
};

export const sections = [
  { id: "stay", label: "Where we stay" },
  { id: "week", label: "The week" },
  { id: "map", label: "Map" },
  { id: "guide", label: "Guide" },
  { id: "price", label: "Price" },
  { id: "contact", label: "Contact" },
] as const;

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
  name: "Résidence L’Oxalys",
  address: "Entrée station, 73440 Val Thorens, France",
  directionsLabel: "Open in Google Maps",
  intro:
    "Self-catered apartments at the entrance to the resort, walking distance from the lifts, the bars and each other.",
  imageAlt:
    "Résidence L’Oxalys’ timber chalet buildings in Val Thorens, with a gondola passing overhead",
  roomsNote: "You pick your roommates when you register on SkiSync.",
};

export const week: Array<{
  day: string;
  date: string;
  title: string;
  status: GuideStatus;
  body: string;
}> = [
  {
    day: "Sat",
    date: "9 Jan",
    title: "Travel day & check-in",
    status: "partial",
    body: "Land, transfer up the mountain, find your building, check in, then a first, gentle night out. Gentle is a word we use loosely.",
  },
  {
    day: "Sun",
    date: "10 Jan",
    title: "First day on snow",
    status: "partial",
    body: "Lift passes and rentals sorted in the morning, then an easy afternoon finding your legs and your group.",
  },
  {
    day: "Mon",
    date: "11 Jan",
    title: "Ski day + theme night",
    status: "soon",
    body: "A full day on the hill. The evening is a theme night — the theme is still being decided, so hold off on the costume shopping.",
  },
  {
    day: "Tue",
    date: "12 Jan",
    title: "Ski day",
    status: "soon",
    body: "The day we push further into Les 3 Vallées for anyone who wants distance rather than laps.",
  },
  {
    day: "Wed",
    date: "13 Jan",
    title: "Big mountain day",
    status: "soon",
    body: "The long one, weather permitting. Non-skiers get their own full programme on the same day.",
  },
  {
    day: "Thu",
    date: "14 Jan",
    title: "Ski day + theme night",
    status: "soon",
    body: "Second theme night, and the point in the week where the team games usually get decided.",
  },
  {
    day: "Fri",
    date: "15 Jan",
    title: "Last day & final night",
    status: "soon",
    body: "Last laps, closing après, and the night nobody sensibly plans around an early transfer.",
  },
  {
    day: "Sat",
    date: "16 Jan",
    title: "Home",
    status: "partial",
    body: "Pack, clean the apartment, transfer back down to the airport. Times will be published well in advance.",
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

export const offSnow = {
  status: "soon" as GuideStatus,
  intro:
    "Some people never planned to ski. Some twist a knee on Monday. Some simply need a day that starts after midday. There is a proper daytime programme for all three, running through the week — not a consolation prize.",
  title: "Not skiing",
  forthcomingNote: "Day-by-day activities and meeting points are coming soon.",
};

export const goingOut = {
  status: "soon" as GuideStatus,
  title: "Eating & going out",
  // Shown in place of each group's body while this section is still "soon".
  placeholder: "shortlist coming soon.",
  groups: [
    {
      title: "Lunch on the hill",
      body: "A shortlist of mountain restaurants worth the stop, including the ones you can reach without being a good skier.",
    },
    {
      title: "Dinner",
      body: `Where ${trip.people} people can actually eat, and where a group of six should go instead.`,
    },
    {
      title: "Après",
      body: "The meeting points at the bottom of the hill, and the ones that go on far longer than intended.",
    },
    {
      title: "Late and home",
      body: "The clubs, and the honest answer on getting home afterwards in a pedestrian resort.",
    },
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
  link?: { label: string; href: string };
}> = [
  {
    q: "Which flights should I book?",
    a: "Your own — flights aren’t in the package. Aim to land on Saturday 9 January and fly home on Saturday 16 January; Geneva (GVA) is the likely airport.",
    status: "partial",
    featured: true,
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
    a: "No. A good share of the group will be on skis for the first time. The beginner slopes start in the village and lesson options are being arranged.",
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
    q: "Can I cancel?",
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
];

export const contacts = {
  status: "partial" as GuideStatus,
  title: "Contact",
  // Plain text, no phone numbers, no personal emails, no WhatsApp invite
  // link on the public page — see hard rules 2 and 3 in CLAUDE.md.
  body: "Questions? Message the trip WhatsApp group.",
};

// Val Thorens sits at roughly 45.298N, 6.580E. Pin positions below are
// APPROXIMATE placeholders carried over from the old schematic diagram —
// they put each place in about the right part of the bowl, not on its real
// doorstep. The committee should replace lat/lng with real values. Until
// then the detail card's linked title is the authoritative locator: it
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

// One colour per kind. Drinks & bars is red (#b91c1c) rather than purple:
// every purple tested collapses into the stay blue under red-green colour
// blindness, while this red stays distinct from all three others and holds
// white icons at 6.5:1 contrast.
export type MapKind = "stay" | "lift" | "lunch" | "nightlife";
export type MapIcon = "house" | "lift" | "fork" | "glass";

export const mapKinds: Array<{
  id: MapKind;
  label: string;
  icon: MapIcon;
  color: string;
}> = [
  { id: "stay", label: "Where we stay", icon: "house", color: "#2563eb" },
  { id: "lift", label: "Lifts", icon: "lift", color: "#10b981" },
  { id: "lunch", label: "Mountain lunch", icon: "fork", color: "#f59e0b" },
  { id: "nightlife", label: "Drinks & bars", icon: "glass", color: "#b91c1c" },
];

export const mapPoints: Array<{
  name: string;
  kind: MapKind;
  lat: number;
  lng: number;
  note: string;
  status: GuideStatus;
}> = [
  {
    // Real position, from OpenStreetMap (Voie de la Boucle, at the entrance
    // to the resort). The other pins are still approximate.
    name: "Résidence L’Oxalys",
    kind: "stay",
    lat: 45.29784,
    lng: 6.57711,
    note: "Where we stay: self-catered apartments at the entrance to the resort.",
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
    note: "Fast way up the east side of the bowl and into the glacier runs.",
    status: "partial",
  },
  {
    // The Cime Caron cable car starts outside the map, at the top of this
    // gondola; the village station is where the trip up begins.
    name: "Caron gondola (to Cime Caron)",
    kind: "lift",
    lat: 45.29428,
    lng: 6.56455,
    note: "Up to the Cime Caron cable car: 3,200m and the big view. Queue early on a clear day.",
    status: "partial",
  },
  {
    name: "Beginner carpets",
    kind: "lift",
    lat: 45.294,
    lng: 6.5804,
    note: "Gentle slopes at the edge of the village — day one starts here.",
    status: "partial",
  },
  {
    name: "Plein Sud chair",
    kind: "lift",
    lat: 45.29519,
    lng: 6.57198,
    note: "The main lift out of the village and the route to Les 3 Vallées.",
    status: "partial",
  },
  {
    name: "Chalet de la Marine",
    kind: "lunch",
    lat: 45.302,
    lng: 6.5909,
    note: "Long lunch on the terrace, reachable on an easy blue.",
    status: "soon",
  },
  {
    name: "Chez Pépé Nicolas",
    kind: "lunch",
    lat: 45.2968,
    lng: 6.5937,
    note: "Old farm, big plates, slightly further out.",
    status: "soon",
  },
  {
    name: "La Folie Douce",
    kind: "nightlife",
    lat: 45.3,
    lng: 6.586,
    note: "Top of Plein Sud. Starts mid-afternoon, and you still have to ski down.",
    status: "soon",
  },
  {
    name: "360 Bar",
    kind: "nightlife",
    lat: 45.296,
    lng: 6.5832,
    note: "Bottom of the slope, first stop coming off the mountain.",
    status: "soon",
  },
  {
    name: "Le Malaysia",
    kind: "nightlife",
    lat: 45.2932,
    lng: 6.5811,
    note: "Underground, very large, very late.",
    status: "soon",
  },
  {
    name: "Klub Summit",
    kind: "nightlife",
    lat: 45.2928,
    lng: 6.5839,
    note: "In the middle of the village, a short walk from most doors.",
    status: "soon",
  },
];

// Search by name rather than by our approximate coordinates, so the link
// lands on the real place even while the pin is still a placeholder.
export function googleMapsUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name} ${trip.destination}`,
  )}`;
}
