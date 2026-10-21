import { Plane, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCrewAccess } from "@/lib/social/source";

// Tells the flights card (in Getting here & away) to open, even when the hash is
// already #flights and so will not change.
const openFlights = () => window.dispatchEvent(new Event("open-flights"));

/**
 * The buttons on the right of every header, so the bar looks the same on the
 * guide and on every other page: My flights, Crew (signed-in members only) and
 * Members. Off the guide, My flights goes to the guide's flights pop-up.
 */
export function HeaderActions({ onGuide }: { onGuide: boolean }) {
  const crew = useCrewAccess();
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" className="rounded-md">
        <a href={onGuide ? "#flights" : "/#flights"} onClick={onGuide ? openFlights : undefined}>
          <Plane aria-hidden="true" className="size-4" />
          My flights
        </a>
      </Button>
      {crew.signedIn && (
        <Button asChild variant="outline" size="sm" className="rounded-md">
          <a href="/crew#teams" aria-label="Crew">
            <Users aria-hidden="true" className="size-4" />
            <span className="hidden min-[440px]:inline">Crew</span>
          </a>
        </Button>
      )}
      <Button asChild variant="outline" size="sm" className="rounded-md">
        <a href="/members">Members</a>
      </Button>
    </div>
  );
}
