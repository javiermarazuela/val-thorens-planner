export type RosterEntry = { name: string; team: number; isMe: boolean };
export type TeamScore = { team: number; points: number };
export type PointsEntry = {
  id: number;
  team: number;
  points: number;
  reason: string;
  createdAt: string;
};

export type Photo = {
  id: string;
  team: number;
  challenge: string;
  status: "pending" | "approved" | "rejected";
  /** A link the browser can show; empty if it could not be made. */
  url: string;
  mine: boolean;
};

export type TeamsState = {
  status: "loading" | "signed-out" | "signed-in" | "unavailable";
  signIn: (() => void) | null;
  /** Null until the committee has put this person on a team. */
  myTeam: number | null;
  roster: RosterEntry[];
  scores: TeamScore[];
  log: PointsEntry[];
  photos: Photo[];
  isAdmin: boolean;
  /** Returns an error message, or null on success. */
  submitPhoto: (challenge: string, file: File) => Promise<string | null>;
  /** Admin: approve a photo and give its team points, or reject it (points null). */
  reviewPhoto: (photo: Photo, points: number | null) => Promise<string | null>;
  /** Admin: give a team points. */
  award: (team: number, points: number, reason: string) => Promise<string | null>;
};
