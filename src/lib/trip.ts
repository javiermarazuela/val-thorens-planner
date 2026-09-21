export type GuideStatus = "confirmed" | "partial" | "soon";

export const trip = {
  destination: "Val Thorens",
  region: "Les 3 Vallées, France",
  dates: "9–16 January 2027",
  datesShort: "9—16 JAN 2027",
  arrival: "Saturday 9 January 2027",
  departure: "Saturday 16 January 2027",
  people: 179,
  altitude: "2,300m",
  linkedPiste: "600km",
  localPiste: "150km",
  updated: "21 September 2026",
  bookingUrl: "",
};

export const sections = [
  { id: "stay", label: "Where we stay" },
  { id: "week", label: "The week" },
  { id: "guide", label: "Guide" },
  { id: "price", label: "Price" },
] as const;

export const resortFacts = [
  { value: trip.altitude, label: "Highest ski resort in Europe", note: "Snow that actually stays snow in January." },
  { value: trip.linkedPiste, label: "Linked piste in Les 3 Vallées", note: "The largest linked ski area in the world." },
  { value: trip.localPiste, label: "Piste in Val Thorens alone", note: "Enough for the week without ever leaving the valley." },
  { value: String(trip.people), label: "Of us going", note: "One resort, one week, everyone within walking distance." },
];

export const resortPoints = [
  "The resort is compact and largely pedestrian — no buses, no valley drives, no car.",
  "Almost everything is ski-in ski-out: you clip in near your door and clip out at the bar.",
  "Roughly three hours from Geneva or Lyon, two from Chambéry.",
  "It sits above the treeline at 2,300m, so the snow is reliable in early January.",
];

export const stay = {
  status: "partial" as GuideStatus,
  known: [
    "Everyone is housed inside Val Thorens itself — nobody is down the valley.",
    "Accommodation is self-catered apartments, walking distance from the main lifts and the bars.",
    "Groups are allocated by chalet, and those chalets become your team for the week's games.",
  ],
  forthcoming: [
    "The building names and exact locations",
    "The rooming list and who you are sharing with",
    "Check-in and check-out times, and where to collect keys",
  ],
  roomsNote:
    "Rooms are drawn on the Saturday night, together, in the same room. Arriving first does not get you the good one.",
  mapUrl: "https://www.valthorens.com/en/interactive-map/",
};

export const week: Array<{
  day: string;
  date: string;
  title: string;
  status: GuideStatus;
  body: string;
}> = [
  { day: "Sat", date: "9 Jan", title: "Travel day & room draw", status: "partial", body: "Land, transfer up the mountain, find your building, draw rooms, then a first, gentle night out. Gentle is a word we use loosely." },
  { day: "Sun", date: "10 Jan", title: "First day on snow", status: "partial", body: "Lift passes and rentals sorted in the morning, then an easy afternoon finding your legs and your group." },
  { day: "Mon", date: "11 Jan", title: "Ski day + theme night", status: "soon", body: "A full day on the hill. The evening is a theme night — the theme is still being decided, so hold off on the costume shopping." },
  { day: "Tue", date: "12 Jan", title: "Ski day", status: "soon", body: "The day we push further into Les 3 Vallées for anyone who wants distance rather than laps." },
  { day: "Wed", date: "13 Jan", title: "Big mountain day", status: "soon", body: "The long one, weather permitting. Non-skiers get their own full programme on the same day." },
  { day: "Thu", date: "14 Jan", title: "Ski day + theme night", status: "soon", body: "Second theme night, and the point in the week where the team games usually get decided." },
  { day: "Fri", date: "15 Jan", title: "Last day & final night", status: "soon", body: "Last laps, closing après, and the night nobody sensibly plans around an early transfer." },
  { day: "Sat", date: "16 Jan", title: "Home", status: "partial", body: "Pack, clean the apartment, transfer back down to the airport. Times will be published well in advance." },
];

export const mountain = {
  status: "partial" as GuideStatus,
  known: [
    "Val Thorens has 150km of its own piste, linked into 600km across Les 3 Vallées.",
    "There are wide, gentle beginner areas right in the village — day one is not a cliff.",
    "Most doors are a short walk or a short ski from a lift.",
  ],
  forthcoming: [
    "The official 2026/27 piste map once the resort publishes it",
    "Rental shop and prices for anyone who did not pre-book skis or a board",
    "Lesson options and beginner group times",
    "Where we meet on the first morning",
  ],
  note: "Last lifts are mid-afternoon. Miss the link back over the ridge and you are looking at an expensive taxi round the valley — plan the last run before you take it.",
  links: [
    { label: "Ski area & piste map", href: "https://www.valthorens.com/en/ski/ski-area/" },
    { label: "Snow report", href: "https://www.valthorens.com/en/ski/snow-report/" },
    { label: "Webcams", href: "https://www.valthorens.com/en/webcams/" },
    { label: "Weather", href: "https://www.valthorens.com/en/weather/" },
  ],
};

export const offSnow = {
  status: "soon" as GuideStatus,
  intro:
    "Some people never planned to ski. Some twist a knee on Monday. Some simply need a day that starts after midday. There is a proper daytime programme for all three, running through the week — not a consolation prize.",
  known: [
    "Organised daytime activities on every day of the week, open to anyone — including skiers taking a day off.",
    "The village is walkable, so nothing requires a lift pass or a transfer.",
    "Lunches and après are shared with everyone coming off the mountain, so you are never eating alone.",
  ],
  forthcoming: [
    "The day-by-day activity list",
    "Meeting points and times",
    "Anything that costs extra or needs booking in advance",
  ],
};

export const goingOut = {
  status: "soon" as GuideStatus,
  groups: [
    { title: "Lunch on the hill", body: "A shortlist of mountain restaurants worth the stop, including the ones you can reach without being a good skier." },
    { title: "Dinner", body: "Where 179 people can actually eat, and where a group of six should go instead." },
    { title: "Après", body: "The meeting points at the bottom of the hill, and the ones that go on far longer than intended." },
    { title: "Late and home", body: "The clubs, and the honest answer on getting home afterwards in a pedestrian resort." },
  ],
};

export const teamGames = {
  status: "soon" as GuideStatus,
  body:
    "Your apartment is your team. Points are earned across the week for challenges on and off the mountain, and the rules and scoring will be published here in full. This site shows the rules only — there is no scoreboard and nothing to submit.",
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
      "Passport, valid well beyond January 2027",
      "Travel insurance with winter sports cover",
      "GHIC or EHIC card",
      "Bank card, plus a small amount of euros as backup",
      "Booking and transfer confirmations, saved offline",
      "Phone charger and a power bank",
    ],
  },
];

export const pricing = {
  status: "partial" as GuideStatus,
  known: [
    "Approximate price per person: ~€2,000.",
    "One price covers accommodation, transfers and the organised programme.",
    "Payment is staged, not one lump sum.",
  ],
  forthcoming: [
    "Exactly what is and is not included",
    "Deposit amount and payment dates",
    "Whether lift pass and rental are bundled or bought separately",
  ],
  note: "The final price is still being signed off by the committee. The ~€2,000 figure is the best estimate right now; the confirmed number will replace it here as soon as it is set.",
};

export const transfers = {
  status: "partial" as GuideStatus,
  headline: "Fly to Geneva (GVA).",
  body: "Book your flights to Geneva Airport. We recommend the morning arrivals on Saturday 9 January and the afternoon departures on Saturday 16 January — exact flight numbers are being confirmed. We organise the coaches from Geneva up to Val Thorens, both ways.",
};

export const faqs: Array<{ q: string; a: string; status: GuideStatus }> = [
  { q: "Which flights should I book?", a: "Fly into Geneva (GVA). We recommend the Saturday morning arrival and the following Saturday afternoon return; the two recommended flights will be posted here shortly. We run the coaches from Geneva to the resort and back.", status: "partial" },
  { q: "What time is the last lift?", a: "Mid-afternoon, roughly 16:15–16:45 depending on the lift. Miss the link back over the ridge from Méribel or Courchevel and it is a long, expensive taxi round the valley — start heading home by 15:30.", status: "confirmed" },
  { q: "What if I get injured?", a: "There is a medical centre in the village and piste rescue on the mountain. Insurance covering winter sports and mountain rescue is mandatory, not optional. Organisers are reachable all week, and the daytime programme means you are not stuck in an apartment alone.", status: "partial" },
  { q: "What if I don’t ski?", a: "You are in good company — plenty of the group won't be on the mountain every day. The village is compact and pedestrian, a pedestrian lift pass gets you up to the terraces for lunch and après with everyone else, and there is tobogganing, a spa and snowshoeing on top of that.", status: "partial" },
  { q: "Do I need to have skied before?", a: "No. A good share of the group will be on skis for the first time. The beginner slopes start in the village and lesson options are being arranged.", status: "partial" },
  { q: "Cash or card?", a: "Card almost everywhere. Bring around €50 in cash for the odd locker, tip or taxi that isn't.", status: "confirmed" },
  { q: "Can I bring my own skis?", a: "Yes. If you are renting instead, pre-booking is cheaper and faster than queueing in resort on the Sunday morning.", status: "confirmed" },
];


export const contacts = {
  status: "confirmed" as GuideStatus,
  body:
    "Jonah is your first point of contact: +1 (202) 557-9599. The full committee list, WhatsApp group link and urgent-help number will be published here before departure.",
};
