export type SlopePlan = { time: string; place: string; level: string };

export type BoardEntry = SlopePlan & { name: string; isMe: boolean };

export type SlopesState = {
  status: "loading" | "signed-out" | "signed-in" | "unavailable";
  signIn: (() => void) | null;
  /** The person's own plan for the day, if they have posted one. */
  myPlan: SlopePlan | null;
  /** Everyone's plans for the day, me included. */
  entries: BoardEntry[];
  /** Returns an error message, or null on success. */
  save: (plan: SlopePlan) => Promise<string | null>;
  remove: () => Promise<string | null>;
};
