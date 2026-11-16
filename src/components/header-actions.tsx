import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCrewAccess } from "@/lib/social/source";

/**
 * The buttons on the right of every header, so the bar looks the same on the
 * guide and on every other page: Crew (signed-in members, when Crew is on) and
 * Members. Flights now live on the Members page only.
 */
export function HeaderActions() {
  const crew = useCrewAccess();
  return (
    <div className="flex items-center gap-2">
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
