import type { ChatProfile, LegInfo } from "./types";

// The person's own details as plain lines, for Julian's AI step. Only this
// person's data is ever put in, never anyone else's room.
function legText(label: string, l: LegInfo | null): string {
  if (!l) return `${label}: not in yet`;
  const parts = [
    l.date ? `date ${l.date}` : null,
    l.time ? `time ${l.time}` : null,
    l.flight ? `flight ${l.flight}` : null,
    l.route ? `route ${l.route}` : null,
    l.how && l.how !== "geneva" ? `travelling a different way (${l.how})` : null,
    l.note,
    l.coachName ? `airport coach ${l.coachName}${l.coachWhen ? ` at ${l.coachWhen}` : ""}` : null,
    l.pickup ? `meeting point ${l.pickup}` : null,
    !l.coachName && l.coachWhy ? `no group coach: ${l.coachWhy}` : null,
    !l.coachName && !l.coachWhy ? "coach not assigned yet (to be confirmed)" : null,
  ].filter(Boolean);
  return `${label}: ${parts.join(", ") || "no details"}`;
}

export function profileToText(p: ChatProfile | null): string {
  if (!p) return "No personal details available.";
  const room = p.room
    ? `Room: ${p.room.room} at ${p.room.residence}${p.room.type ? ` (${p.room.type})` : ""}${
        p.room.roommates?.length ? `, sharing with ${p.room.roommates.join(", ")}` : ""
      }`
    : "Room: not assigned yet (to be confirmed)";
  return [
    `Name: ${p.name ?? "unknown"}`,
    room,
    legText("Coming", p.arrival),
    legText("Going home", p.departure),
  ].join("\n");
}
