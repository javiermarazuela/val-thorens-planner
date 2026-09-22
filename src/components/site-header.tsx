import { useState } from "react";
import { Menu, MountainSnow, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sections, site, trip } from "@/lib/trip";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5" aria-label={site.backToTopLabel}>
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <MountainSnow aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-display text-sm uppercase leading-none">{site.name}</span>
            <span className="mt-1 block text-[0.65rem] font-bold text-muted-foreground">
              {trip.datesShort}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="rounded-full px-3 py-2 text-xs font-extrabold uppercase text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-md lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </Button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Sections"
          className="border-t border-border bg-background px-4 pb-5 pt-2 lg:hidden"
        >
          <ul className="grid gap-1 sm:grid-cols-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-sm font-bold uppercase text-foreground hover:bg-secondary"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
