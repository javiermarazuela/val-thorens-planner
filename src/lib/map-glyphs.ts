import type { MapIcon } from "@/lib/trip";

// Minimal glyphs, drawn at 24x24. Kept as raw markup rather than components
// because the map's marker elements are built as HTML strings; the tiles in
// Things to do use the same markup so both show the same icon.
export const GLYPH: Record<MapIcon, string> = {
  house: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9.5 21v-6h5v6"/>',
  lift: '<path d="M4 4h16"/><path d="M12 4v6"/><path d="M7 10h10l-1.5 8h-7z"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6z"/><path d="M17 9v12"/>',
  skis: '<path d="M7 3c-1.2.2-2 1-2.2 2.2L18 21"/><path d="M17 3c1.2.2 2 1 2.2 2.2L6 21"/>',
  beer: '<path d="M5 9h10v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M15 11h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H15"/><path d="M5 9c-1-2 .5-4 2.5-3.5C8.5 3.5 11.5 3.5 12.5 5.5 14.5 5 16 7 15 9"/>',
  disco:
    '<path d="M12 2v3"/><circle cx="12" cy="13" r="8"/><path d="M4 13h16"/><path d="M6 8.5h12M6 17.5h12"/><path d="M12 5c-3 3-3 13 0 16"/><path d="M12 5c3 3 3 13 0 16"/>',
  wave: '<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  cross: '<path fill="currentColor" d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
};

// The round map pin: a coloured disc with the kind's glyph in it.
export function markerHtml(
  color: string,
  icon: MapIcon,
  ink = "#fff",
  ring = "#fff",
  size = 24,
): string {
  return `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:1.5px solid ${ring};display:grid;place-items:center;box-sizing:border-box;"><svg viewBox="0 0 24 24" width="${Math.round(size * 0.6)}" height="${Math.round(size * 0.6)}" fill="none" stroke="${ink}" color="${ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[icon]}</svg></div>`;
}
