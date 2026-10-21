// Shared shapes for the chatbot. Plain data only, so the search and reply code
// can be tried from a script without the app around it.

/** One row of the knowledge sheet (table chat_knowledge). */
export type KbRow = {
  id: string;
  area: string;
  question: string;
  phrasings: string[];
  answer: string;
  visibility: "everyone" | "members";
  status: "confirmed" | "tbc" | "hidden";
  link: string | null;
  sort: number;
};

/** How one leg of a person's trip looks, whatever it was loaded from. */
export type LegInfo = {
  how: "geneva" | "other_flight" | "other" | null;
  date: string | null; // yyyy-mm-dd
  time: string | null; // hh:mm, landing or take-off
  flight: string | null;
  route: string | null;
  note: string | null;
  coachName: string | null; // e.g. "Coach A1"
  coachWhen: string | null; // e.g. "Sat 9 Jan, 08:30"
  pickup: string | null;
  coachWhy: string | null; // why there is no coach, when there is none
  wantsCoach: "yes" | "no" | "unsure" | null;
};

export type ChatProfile = {
  name: string | null;
  email: string;
  // `roommates` is null when we do not know who shares the room.
  room: { residence: string; room: string; type: string | null; roommates: string[] | null } | null;
  arrival: LegInfo | null;
  departure: LegInfo | null;
  /** The person's team, once the committee has announced teams. */
  team?: { name: string; emoji: string } | null;
  /** Every team with its points, best first. */
  standings?: Array<{ name: string; points: number }> | null;
};

export type ChatLink = { label: string; href: string };

/** What the bot says back. */
export type Reply = {
  text: string;
  links?: ChatLink[];
  /** Offer a sign-in button under the message. */
  signIn?: boolean;
  /** Which part of the bot answered, for the log. */
  source: "profile" | "schedule" | "activity" | "search" | "login" | "unknown";
  /** The topic the question belonged to, for grouping in the log. */
  area?: string;
  /** True when the bot had nothing real to say (a "to be confirmed" row). */
  unanswered?: boolean;
};

/** Everything a reply can use. */
export type ReplyContext = {
  now: Date;
  signedIn: boolean;
  profile: ChatProfile | null;
  /** True once we have tried to load the person's own data. */
  profileLoaded: boolean;
};
