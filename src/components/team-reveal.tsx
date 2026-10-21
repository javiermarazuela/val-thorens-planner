import { useEffect, useRef, useState } from "react";

import { useCrewAccess } from "@/lib/social/source";
import { teamById } from "@/lib/social/teams-content";

const KEY = "euro-ski-team-reveal";

function seen(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

// The first time a member opens the guide after teams are out, a card tells
// them their team. Remembered on this device, so it shows once.
export function TeamReveal() {
  const { signedIn, team } = useCrewAccess();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (signedIn && team !== null && seen() !== String(team)) setOpen(true);
  }, [signedIn, team]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    try {
      if (team !== null) window.localStorage.setItem(KEY, String(team));
    } catch {
      // Without storage it just shows again next visit.
    }
    setOpen(false);
  }

  if (team === null) return null;
  const t = teamById(team);
  return (
    <dialog
      ref={ref}
      onClose={close}
      aria-labelledby="team-reveal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-background p-0 text-center text-foreground shadow-xl backdrop:bg-ink/60"
    >
      {open && (
        <div className="px-6 py-8">
          <p className="text-6xl" aria-hidden="true">
            {t.emoji}
          </p>
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Teams are out
          </p>
          <h2 id="team-reveal-title" className="mt-1 font-display text-3xl uppercase">
            Welcome to the {t.name}!
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Meet your teammates, check the challenges and watch the leaderboard.
          </p>
          <div className="mt-6 grid gap-2">
            <a
              href="/crew#teams"
              onClick={close}
              className="rounded-md bg-primary px-4 py-3 font-bold uppercase text-primary-foreground hover:bg-primary/90"
            >
              Meet your team
            </a>
            <button
              type="button"
              onClick={close}
              className="rounded-md px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
