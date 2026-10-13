import { activities, airportCoaches, dayDetails, mapPoints, packing, week } from "@/lib/trip";
import { daysToGo, tripDayIndex } from "@/lib/trip-day";

import { buildIndex, normalise, search, type Index } from "./search";
import type { ChatLink, ChatProfile, KbRow, LegInfo, Reply, ReplyContext } from "./types";

// Julian's answers. Order of attempts for every question:
//   1. small talk,
//   2. the person's own details (room, coach, flights),
//   3. what is on today or tonight,
//   4. suggestions for something to do,
//   5. the knowledge rows (free search),
//   6. a polite "I don't know" (step 2b puts Haiku between 5 and 6).

const WHATSAPP = "message us on the trip WhatsApp group";

const pickOne = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]!;

const has = (q: string, re: RegExp) => re.test(q);

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const dayLabel = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));

function parisHour(now: Date): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  }).format(now);
  return Number(h) % 24;
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// ---------- the person's own details ---------------------------------------

const signInNudge = (what: string): Reply => ({
  text: `Sign in and I'll look up ${what} for you.`,
  signIn: true,
  source: "login",
});

function noData(what: string, ctx: ReplyContext): Reply {
  return {
    text: ctx.profileLoaded
      ? `I can't see ${what} yet, so it's still to be confirmed. Check back soon, or ${WHATSAPP}.`
      : `I'm still fetching ${what}, give it a second and ask again.`,
    source: "profile",
  };
}

function roomReply(profile: ChatProfile | null, ctx: ReplyContext): Reply {
  if (!ctx.signedIn) return signInNudge("your room");
  const room = profile?.room;
  if (!room) {
    return {
      ...noData("your room", ctx),
      text: ctx.profileLoaded
        ? `Rooms aren't assigned yet, so your room is to be confirmed. I'll know as soon as it's in, or ${WHATSAPP}.`
        : "Let me check my notes... ask me again in a second.",
    };
  }
  const mates =
    room.roommates === null
      ? ""
      : room.roommates.length
        ? ` You're sharing with ${list(room.roommates)}.`
        : " It's all yours.";
  const kind = room.type ? `${room.type.toLowerCase()} room` : "room";
  return {
    text: `${pickOne(["Found you!", "Here you go.", "Got it."])} You're in room ${room.room} at ${room.residence}, a ${kind}.${mates}`,
    links: [{ label: "Where we stay", href: "/#stay" }],
    source: "profile",
  };
}

function legLine(leg: LegInfo, kind: "arrival" | "departure"): string {
  const verb = kind === "arrival" ? "in" : "out";
  const when = leg.coachWhen ? `${leg.coachWhen}` : "";
  if (leg.how && leg.how !== "geneva") {
    return `On the way ${verb} you're coming a different way${leg.note ? ` (${leg.note})` : ""}, so there's no group coach for you.`;
  }
  if (leg.coachName) {
    const where = leg.pickup ? `, meeting at ${leg.pickup}` : "";
    return `On the way ${verb}: ${leg.coachName} at ${when}${where}.`;
  }
  if (leg.wantsCoach === "no") return `On the way ${verb}: you said you don't need a coach.`;
  if (leg.coachWhy)
    return `On the way ${verb}: no group coach fits your flight (${leg.coachWhy.toLowerCase()}). A shared taxi or transfer works, and sharing is cheaper.`;
  if (leg.wantsCoach === "unsure")
    return `On the way ${verb}: you weren't sure about the coach, so it's still to be confirmed.`;
  return `On the way ${verb}: your coach isn't assigned yet, so it's to be confirmed.`;
}

function coachReply(profile: ChatProfile | null, ctx: ReplyContext, q: string): Reply {
  const general = `Airport coaches leave Geneva at ${list(airportCoaches.out.times)}, and go back at ${list(airportCoaches.home.coaches.map((c) => c.time))}. All to be confirmed.`;
  if (!ctx.signedIn) {
    return {
      text: `${general} Sign in and I'll tell you which one is yours.`,
      signIn: true,
      source: "login",
    };
  }
  const arrival = profile?.arrival;
  const departure = profile?.departure;
  if (!arrival && !departure) {
    return {
      text: `${noData("your coach", ctx).text} The flights button in Getting here & away is how you tell us when you land.`,
      links: [{ label: "Getting here & away", href: "/#getting-here" }],
      source: "profile",
    };
  }
  const wantsOut = has(q, /\b(back|leave|leaving|home|depart|departure|return|going home)\b/);
  const wantsIn = has(
    q,
    /\b(arrive|arrival|arriving|get there|getting there|land|landing|coming|first)\b/,
  );
  const idx = tripDayIndex(ctx.now);
  // Once the week is under way (or over), the way home is what matters.
  const onlyHome = wantsOut || (!wantsIn && (idx === null ? daysToGo(ctx.now) === null : idx > 0));
  const parts: string[] = [];
  if (!onlyHome && arrival) parts.push(legLine(arrival, "arrival"));
  if (!wantsIn && departure) parts.push(legLine(departure, "departure"));
  return {
    text: parts.join(" "),
    links: [{ label: "Getting here & away", href: "/#getting-here" }],
    source: "profile",
  };
}

function flightsReply(profile: ChatProfile | null, ctx: ReplyContext): Reply {
  if (!ctx.signedIn) return signInNudge("your flights");
  const { arrival, departure } = profile ?? { arrival: null, departure: null };
  if (!arrival && !departure) {
    return {
      text: `I don't have your flights yet. Use the "Tell us how you're getting here" button and I'll know.`,
      links: [{ label: "Getting here & away", href: "/#getting-here" }],
      source: "profile",
    };
  }
  const describe = (leg: LegInfo | null, label: string, verb: string) => {
    if (!leg) return `${label}: not in yet.`;
    if (leg.how && leg.how !== "geneva" && !leg.flight)
      return `${label}: ${leg.note ?? "another way"}.`;
    const day = leg.date ? dayLabel(leg.date) : "date to be confirmed";
    const time = leg.time ? `, ${verb} ${leg.time}` : "";
    const flight = leg.flight ? `, ${leg.flight}${leg.route ? ` (${leg.route})` : ""}` : "";
    return `${label}: ${day}${time}${flight}.`;
  };
  return {
    text: `${describe(arrival, "Coming", "lands")} ${describe(departure, "Going home", "leaves")}`,
    links: [{ label: "Getting here & away", href: "/#getting-here" }],
    source: "profile",
  };
}

// ---------- what is on ------------------------------------------------------

function eventsOn(day: number): string[] {
  return dayDetails[day]?.events.map((e) => e.what) ?? [];
}

const tbcTimes = "Times and venues are still to be confirmed.";

function scheduleReply(q: string, ctx: ReplyContext): Reply {
  const links: ChatLink[] = [{ label: "The week", href: "/#schedule" }];
  const idx = tripDayIndex(ctx.now);
  const toGo = daysToGo(ctx.now);

  if (idx === null && toGo !== null) {
    return {
      text: `The trip starts on Saturday 9 January, ${toGo} day${toGo === 1 ? "" : "s"} to go. First up is arrivals, then Welcome Drinks. ${tbcTimes}`,
      links,
      source: "schedule",
    };
  }
  if (idx === null) {
    return { text: "The trip's wrapped up. I hope it was brilliant!", source: "schedule" };
  }

  const hour = parisHour(ctx.now);
  const day = week[idx]!;
  const wantsTomorrow = has(q, /\btomorrow\b/);
  const wantsTonight = has(q, /\b(tonight|this evening|evening)\b/);

  if (wantsTomorrow) {
    const next = idx + 1;
    if (next >= week.length)
      return { text: "That's the last day, so tomorrow is home time.", source: "schedule", links };
    const ev = eventsOn(next);
    const nd = week[next]!;
    return {
      text: ev.length
        ? `Tomorrow (${nd.day} ${nd.date}) is ${nd.title.toLowerCase()}, with ${list(ev)} in the evening. ${tbcTimes}`
        : `Tomorrow (${nd.day} ${nd.date}) is ${nd.title.toLowerCase()}, and nothing is planned in the evening.`,
      links,
      source: "schedule",
    };
  }

  const ev = eventsOn(idx);
  if (wantsTonight || (has(q, /\b(next|whats next)\b/) === false && hour >= 17 && ev.length)) {
    return {
      text: ev.length
        ? `Tonight (${day.day} ${day.date}): ${list(ev)}. ${tbcTimes}`
        : `Nothing planned tonight (${day.day} ${day.date}). A good night for a proper dinner.`,
      links: [...links, { label: "Daily plan", href: "/#daily-plan" }],
      source: "schedule",
    };
  }

  // "Next event" or "what's on": today's evening events if they are still ahead,
  // otherwise the next day that has some.
  if (ev.length && hour < 22) {
    return {
      text: `Next up is ${list(ev)} this evening (${day.day} ${day.date}). ${tbcTimes}`,
      links,
      source: "schedule",
    };
  }
  for (let d = idx + 1; d < week.length; d++) {
    const more = eventsOn(d);
    if (more.length) {
      const nd = week[d]!;
      return {
        text: `Next up is ${list(more)} on ${nd.day} ${nd.date}. ${tbcTimes}`,
        links,
        source: "schedule",
      };
    }
  }
  return {
    text: "That's the last of the planned events. Enjoy the final stretch!",
    links,
    source: "schedule",
  };
}

// ---------- something to do ---------------------------------------------------

type Pick = { names: string[]; links: ChatLink[]; lead: string };

const activityBy = (group: string): ChatLink[] =>
  activities.filter((a) => a.group === group).map((a) => ({ label: a.name, href: a.url }));
const pointsBy = (kind: string): string[] =>
  mapPoints.filter((p) => p.kind === kind).map((p) => p.name);

function activityPick(q: string, hour: number): Pick | null {
  if (has(q, /\b(spa|sauna|massage|wellness|pool|swim|swimming|relax|relaxing|hot tub)\b/))
    return {
      lead: "Feeling a spa day? Try",
      names: [],
      links: activityBy("indoors").filter((l) => /spa|board/i.test(l.label)),
    };
  if (
    has(
      q,
      /\b(thrill|thrills|thrilling|thrilled|adrenaline|exciting|excitement|fast|crazy|wild|kart|karting|snowmobile|snowmobiling|tubing|luge|toboggan|fat bike)\b/,
    )
  )
    return {
      lead: "For some adrenaline, try",
      names: [],
      links: activityBy("thrills").slice(0, 4),
    };
  if (
    has(
      q,
      /\b(view|views|scenic|romantic|photo|photos|helicopter|dog|sledding|snowshoe|snowshoeing|walk|walking)\b/,
    )
  )
    return {
      lead: "For a view worth the photo, try",
      names: [],
      links: activityBy("views").slice(0, 4),
    };
  if (
    has(
      q,
      /\b(dont want to ski|not ski|not skiing|rest day|bad weather|rain|raining|storm|tired legs|sore|indoors|indoor|rainy day)\b/,
    )
  )
    return {
      lead: "Legs say no? Try",
      names: [],
      links: [...activityBy("indoors"), ...activityBy("views").slice(0, 2)],
    };
  if (has(q, /\b(eat|hungry|lunch|dinner|restaurant|restaurants|food|breakfast)\b/))
    return {
      lead: "For a meal, the options on our list are",
      names: pointsBy("restaurant"),
      links: [],
    };
  if (has(q, /\b(club|clubs|dance|dancing|party|nightclub)\b/))
    return {
      lead: "For a late night, the options on our list are",
      names: pointsBy("club"),
      links: [],
    };
  if (has(q, /\b(apres)\b/))
    return { lead: "For après, the options on our list are", names: pointsBy("apres"), links: [] };
  if (has(q, /\b(bar|bars|drink|drinks|pub|beer|vin chaud)\b/))
    return { lead: "For a drink, the options on our list are", names: pointsBy("bar"), links: [] };
  if (
    has(
      q,
      /\b(something to do|things to do|what can i do|what should i do|bored|activity|activities|fun|ideas)\b/,
    )
  ) {
    if (hour >= 18)
      return {
        lead: "For tonight, try",
        names: [],
        links: activityBy("indoors").filter((l) => /bowling/i.test(l.label)),
      };
    return {
      lead: "For something different, try",
      names: [],
      links: [
        ...activityBy("thrills").slice(0, 2),
        ...activityBy("views").slice(0, 1),
        ...activityBy("indoors").slice(2),
      ],
    };
  }
  return null;
}

function activityReply(q: string, ctx: ReplyContext): Reply | null {
  const pick = activityPick(q, parisHour(ctx.now));
  if (!pick) return null;
  const items = [...pick.names, ...pick.links.map((l) => l.label)];
  if (!items.length) return null;
  const evening = pick.lead.startsWith("For tonight") ? " Or ask me what's on tonight." : "";
  return {
    text: `${pick.lead} ${list(items)}. These are ideas, so check opening hours and prices before you go.${evening}`,
    links: [...pick.links, { label: "Beyond the slopes", href: "/#todo" }].slice(0, 5),
    source: "activity",
  };
}

// ---------- packing -----------------------------------------------------------

function packingReply(): Reply {
  const essentials = (packing[0]?.items ?? [])
    .slice(0, 7)
    .map((item) => item.split(/ [—(]/)[0]!.replace(/,.*$/, "").trim().toLowerCase());
  return {
    text: `The essentials: ${list(essentials)}. The full tick-list is in the guide, and it saves on your phone.`,
    links: [{ label: "Packing list", href: "/#links" }],
    source: "search",
  };
}

// ---------- knowledge rows ----------------------------------------------------

function rowReply(row: KbRow): Reply {
  const answered = row.answer.trim().length > 0;
  const link: ChatLink[] = row.link
    ? [{ label: row.link.startsWith("/") ? "More on the guide" : "Open link", href: row.link }]
    : [];
  if (!answered) {
    return {
      text: `That one's still to be confirmed. Check back soon, or ${WHATSAPP}.`,
      links: link,
      source: "search",
      area: row.area,
      unanswered: true,
    };
  }
  const hedge =
    row.status === "tbc" && !/to be confirmed|tbc|preliminary/i.test(row.answer)
      ? " (Still to be confirmed.)"
      : "";
  return { text: `${row.answer.trim()}${hedge}`, links: link, source: "search", area: row.area };
}

// ---------- the front door --------------------------------------------------------

export type ChatBrain = { index: Index };

export function makeBrain(rows: KbRow[]): ChatBrain {
  return { index: buildIndex(rows) };
}

const defaultArea: Record<Reply["source"], string> = {
  profile: "My details",
  schedule: "Social",
  activity: "Beyond the slopes",
  search: "Other",
  login: "Other",
  unknown: "Other",
};

/** Julian's free-tier answer, with the topic filled in for the log. */
export function answer(question: string, brain: ChatBrain, ctx: ReplyContext): Reply {
  const reply = answerCore(question, brain, ctx);
  return reply.area ? reply : { ...reply, area: defaultArea[reply.source] };
}

function answerCore(question: string, brain: ChatBrain, ctx: ReplyContext): Reply {
  const raw = question.trim();
  const q = normalise(raw);

  if (has(q, /^(hi|hello|hey|yo|hola|bonjour|good (morning|evening|afternoon))( julian)?$/))
    return {
      text: "Hey there! Ask me anything about the trip, or tap one of the ideas below.",
      source: "search",
    };
  if (has(q, /^(thanks|thank you|thx|cheers|merci|ty)\b/))
    return {
      text: pickOne(["Anytime!", "Happy to help.", "Any time. Go get that snow."]),
      source: "search",
    };
  if (has(q, /\b(who are you|what are you|your name)\b/))
    return {
      text: "I'm Julian, the snowman who knows the trip. Ask me about rooms, coaches, plans, packing, money or what to do.",
      source: "search",
    };

  const profile = ctx.profile;

  if (has(q, /\bmy flights?\b|\bwhen (do|does) my flight\b|\bwhat time (is|does) my flight\b/))
    return flightsReply(profile, ctx);
  if (
    has(q, /\b(room|apartment|apt|flat|accommodation|residence|bed)\b/) &&
    (has(q, /\bmy\b/) ||
      has(q, /\bwhich (room|apartment|apt|flat|residence|bed)\b/) ||
      has(q, /\bwhere am i\b/)) &&
    !has(
      q,
      /\b(drops?|dropped|cancel|cancelled|key|keys|wifi|check in|checkin|check out|checkout|towels?|laundry|luggage|bags?)\b/,
    )
  )
    return roomReply(profile, ctx);
  if (
    has(q, /\b(roommates?|room ?mates?|who am i (sharing|rooming|staying) with)\b/) &&
    !has(q, /\b(drops?|dropped|cancel|cancelled|leaves?)\b/)
  )
    return roomReply(profile, ctx);
  if (has(q, /where (am i|will i be|do i) (stay|staying|sleep|sleeping|live|living)/))
    return roomReply(profile, ctx);
  if (
    has(q, /\b(shuttle|coach|transfer)\b/) &&
    (has(q, /\b(my|mine|next|which)\b/) || has(q, /what time|when (is|does|do|will)/)) &&
    !has(q, /how (does|do)|work/)
  )
    return coachReply(profile, ctx, q);

  const doing = has(
    q,
    /\b(can|could|should) i do|something to do|things to do|bored|feeling|fancy|in the mood\b/,
  );
  if (
    !doing &&
    has(
      q,
      /\b(tonight|this evening|tomorrow|next event|whats next|what is next|whats on|what is on|whats happening|what is happening|plans|the plan|what are we doing|schedule|itinerary|today)\b/,
    )
  )
    return scheduleReply(q, ctx);

  if (
    has(
      q,
      /\b(pack|packing|packed|packs)\b|what (to|should i|do i) (wear|bring|pack)|\bwhat to bring\b/,
    )
  )
    return packingReply();

  const activity = activityReply(q, ctx);
  if (activity) return activity;

  // These two rows only exist to tell signed-out visitors to sign in.
  const signedOutOnly = new Set(["room-where", "shuttle-mine"]);
  const matches = search(raw, brain.index, 0.5, 6).filter(
    (m) => !ctx.signedIn || !signedOutOnly.has(m.row.id),
  );
  if (matches.length) {
    // An empty "to be confirmed" row should not hide a real answer that is fairly close.
    const best = matches[0]!;
    const better = best.row.answer.trim()
      ? best
      : (matches.find((m) => m.row.answer.trim() && best.score - m.score < 0.15) ?? best);
    return rowReply(better.row);
  }

  if (!ctx.signedIn) {
    return {
      text: "That's a bit more complex for me. Please sign in for more complex questions.",
      signIn: true,
      source: "login",
    };
  }
  return {
    text: `Hmm, that one's not in my notes yet. Please ${WHATSAPP} and someone will help.`,
    source: "unknown",
  };
}
