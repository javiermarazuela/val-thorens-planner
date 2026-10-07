import { useRouterState } from "@tanstack/react-router";

import sscLogo from "@/assets/ssc-logo.jpg";
import { Button } from "@/components/ui/button";
import { site, trip } from "@/lib/trip";

// The plain header for every page except the guide, which has its own with the trail.
export function SiteHeader() {
  const onGuide = useRouterState({ select: (s) => s.location.pathname === "/" });
  if (onGuide) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label={site.backToTopLabel}>
          <img
            src={sscLogo}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-md object-cover"
          />
          <span>
            <span className="block font-display text-sm uppercase leading-none">{site.name}</span>
            <span className="mt-1 block text-[0.65rem] font-bold text-muted-foreground">
              {trip.datesShort}
            </span>
          </span>
        </a>
        <Button asChild variant="outline" size="sm" className="rounded-md">
          <a href="/members">Members</a>
        </Button>
      </div>
    </header>
  );
}
