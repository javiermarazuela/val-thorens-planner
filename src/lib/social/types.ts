// What the "who is travelling with me" view needs to know about one member.
// Never an email or an account id: the database function behind it leaves
// them out, and the test source mirrors that.

export type Leg = {
  mode: "geneva" | "other_flight" | "other";
  date: string | null;
  flight: string | null;
  airport: string | null;
  /** hh:mm, local time. */
  time: string | null;
  shuttle: "yes" | "no" | "unsure" | null;
};

export type Mate = {
  name: string;
  isMe: boolean;
  arrival: Leg;
  departure: Leg;
};

export type SocialState = {
  status: "loading" | "signed-out" | "signed-in" | "unavailable";
  signIn: (() => void) | null;
  /** Everyone I may see, me included when I have saved flights. */
  mates: Mate[];
  /** Whether other members can see me. */
  visible: boolean;
  setVisible: (next: boolean) => Promise<void>;
};
