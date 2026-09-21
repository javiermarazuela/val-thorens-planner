import { Link } from "@tanstack/react-router";
import { MountainSnow } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Val Thorens 2027 home">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <MountainSnow aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-display text-sm uppercase leading-none">Val Thorens</span>
            <span className="mt-1 block text-xs font-bold text-muted-foreground">09—16 JAN 2027</span>
          </span>
        </Link>
        <nav className="flex rounded-full border border-border bg-card p-1" aria-label="Primary navigation">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-full px-4 py-2 text-xs font-extrabold uppercase text-muted-foreground" activeProps={{ className: "bg-primary text-primary-foreground" }}>Trip</Link>
          <Link to="/guide" className="rounded-full px-4 py-2 text-xs font-extrabold uppercase text-muted-foreground" activeProps={{ className: "bg-primary text-primary-foreground" }}>Guide</Link>
        </nav>
      </div>
    </header>
  );
}