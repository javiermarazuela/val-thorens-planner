import { GLYPH } from "@/lib/map-glyphs";
import type { MapIcon } from "@/lib/trip";

export function MapGlyph({ icon, className }: { icon: MapIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: GLYPH[icon] }}
    />
  );
}
