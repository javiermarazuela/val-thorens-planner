import { useEffect } from "react";

import { useCrewAccess } from "@/lib/social/source";
import { teamById } from "@/lib/social/teams-content";

// Along the bottom of the welcome photo for someone on a team. The flights strip
// takes the spot first, so this only shows once that one is gone.
export function TeamBanner({
  hidden,
  onVisible,
}: {
  hidden: boolean;
  onVisible: (visible: boolean) => void;
}) {
  const { signedIn, team } = useCrewAccess();
  const show = signedIn && team !== null && !hidden;

  useEffect(() => {
    onVisible(show);
  }, [show, onVisible]);

  if (!show || team === null) return null;
  const t = teamById(team);
  return (
    <a
      href="/crew#teams"
      className="absolute inset-x-0 bottom-0 z-10 flex min-h-10 w-full items-center justify-center gap-2 bg-paper/90 px-4 py-2 text-center text-sm font-bold text-ink backdrop-blur-sm transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
    >
      <span aria-hidden="true">{t.emoji}</span>
      You're on Team {t.name}. See the leaderboard
    </a>
  );
}
