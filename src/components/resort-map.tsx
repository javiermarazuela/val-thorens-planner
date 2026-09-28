import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { ExternalLink } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import {
  googleMapsUrl,
  mapKinds,
  mapPoints,
  mapSection,
  resortCentre,
  type MapIcon,
  type MapKind,
} from "@/lib/trip";

// Minimal glyphs, drawn at 24x24 and dropped into a Leaflet divIcon. Kept as
// raw paths rather than components because Leaflet takes an HTML string.
const GLYPH: Record<MapIcon, string> = {
  house: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9.5 21v-6h5v6"/>',
  lift: '<path d="M4 4h16"/><path d="M12 4v6"/><path d="M7 10h10l-1.5 8h-7z"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6z"/><path d="M17 9v12"/>',
  glass: '<path d="M5 3h14l-6 8v7"/><path d="M9 21h6"/>',
};

function markerHtml(color: string, icon: MapIcon, selected: boolean): string {
  const size = selected ? 38 : 30;
  const ring = selected ? "box-shadow:0 0 0 4px rgba(15,23,42,0.35);" : "";
  return `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #fff;display:grid;place-items:center;box-sizing:border-box;${ring}"><svg viewBox="0 0 24 24" width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[icon]}</svg></div>`;
}

function kindOf(id: MapKind) {
  return mapKinds.find((k) => k.id === id) ?? mapKinds[0]!;
}

export function ResortMap() {
  const [active, setActive] = useState<MapKind | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const point = mapPoints.find((p) => p.name === selected) ?? null;

  // Leaflet touches `window`, so it is imported only in the browser. The
  // container renders on the server as an empty box and fills in on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const el = containerRef.current;
      if (cancelled || !el || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(el, { scrollWheelZoom: false }).setView(
        [resortCentre.lat, resortCentre.lng],
        resortCentre.zoom,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      for (const p of mapPoints) {
        const kind = kindOf(p.kind);
        markersRef.current[p.name] = L.marker([p.lat, p.lng], {
          title: p.name,
          alt: p.name,
          keyboard: true,
          icon: L.divIcon({
            className: "vt-pin",
            html: markerHtml(kind.color, kind.icon, false),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        })
          .addTo(map)
          .on("click", () => setSelected(p.name));
      }

      // Open at the tightest view that still shows every pin, so the village
      // cluster spreads out as far as each screen width allows.
      map.fitBounds(L.latLngBounds(mapPoints.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [28, 28],
        maxZoom: 16,
      });

      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Keep pins in step with the filter and the selection.
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L || !ready) return;
    for (const p of mapPoints) {
      const marker = markersRef.current[p.name];
      if (!marker) continue;
      const visible = active === "all" || p.kind === active;
      if (visible && !map.hasLayer(marker)) marker.addTo(map);
      if (!visible && map.hasLayer(marker)) marker.remove();
      const kind = kindOf(p.kind);
      const isSel = selected === p.name;
      const size = isSel ? 38 : 30;
      marker.setIcon(
        L.divIcon({
          className: "vt-pin",
          html: markerHtml(kind.color, kind.icon, isSel),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
      );
      marker.setZIndexOffset(isSel ? 1000 : 0);
    }
  }, [active, selected, ready]);

  const choose = (name: string) => {
    setSelected(name);
    const p = mapPoints.find((x) => x.name === name);
    if (p) mapRef.current?.panTo([p.lat, p.lng]);
  };

  const legend = (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => setActive("all")}
        className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
          active === "all"
            ? "border-foreground bg-foreground text-background"
            : "border-border hover:border-foreground"
        }`}
      >
        {mapSection.allLabel}
      </button>
      {mapKinds.map((kind) => (
        <button
          key={kind.id}
          type="button"
          onClick={() => setActive(kind.id)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
            active === kind.id
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          <span
            className="size-2.5 rounded-full"
            style={{ background: kind.color }}
            aria-hidden="true"
          />
          {kind.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div>
          <div
            ref={containerRef}
            aria-label="Map of Val Thorens showing where we stay, the lifts and the venues"
            className="relative z-0 h-[340px] w-full overflow-hidden rounded-lg border border-border bg-secondary sm:h-[420px] lg:h-[520px]"
          />
          {legend}
        </div>

        <div>
          {point ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ background: kindOf(point.kind).color }}
                  aria-hidden="true"
                />
                <a
                  href={googleMapsUrl(point.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
                >
                  {point.name}
                </a>
                <StatusBadge status={point.status} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.note}</p>
              <a
                href={googleMapsUrl(point.name)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary"
              >
                {mapSection.openInMaps}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{mapSection.hint}</p>
          )}

          <ul className="mt-4 grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-1 lg:gap-1">
            {mapPoints
              .filter((p) => active === "all" || p.kind === active)
              .map((p) => (
                <li key={p.name}>
                  <button
                    type="button"
                    onClick={() => choose(p.name)}
                    className={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm leading-snug transition sm:gap-3 sm:px-3 ${
                      selected === p.name
                        ? "border-foreground"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: kindOf(p.kind).color }}
                      aria-hidden="true"
                    />
                    {p.name}
                  </button>
                </li>
              ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {mapSection.approxNote}
          </p>
        </div>
      </div>
    </div>
  );
}
