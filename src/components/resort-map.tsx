import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

import { loadStyle } from "@/components/map-style";
import {
  googleMapsUrl,
  mapArea,
  mapKinds,
  mapPoints,
  mapSection,
  type MapIcon,
  type MapKind,
} from "@/lib/trip";

// Minimal glyphs, drawn at 24x24 inside each marker. Kept as raw paths rather
// than components because the marker element is built as an HTML string.
const GLYPH: Record<MapIcon, string> = {
  house: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9.5 21v-6h5v6"/>',
  lift: '<path d="M4 4h16"/><path d="M12 4v6"/><path d="M7 10h10l-1.5 8h-7z"/>',
  fork: '<path d="M7 3v8a2 2 0 0 0 4 0V3"/><path d="M9 11v10"/><path d="M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6z"/><path d="M17 9v12"/>',
  glass: '<path d="M5 3h14l-6 8v7"/><path d="M9 21h6"/>',
  mug: '<path d="M5 6h10v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M15 9h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H15"/><path d="M8 3v1.5M12 3v1.5"/>',
  wave: '<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
};

function markerHtml(color: string, icon: MapIcon): string {
  const size = 30;
  return `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #fff;display:grid;place-items:center;box-sizing:border-box;"><svg viewBox="0 0 24 24" width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[icon]}</svg></div>`;
}

function kindOf(id: MapKind) {
  return mapKinds.find((k) => k.id === id) ?? mapKinds[0]!;
}

export function ResortMap() {
  const [active, setActive] = useState<MapKind | "all">("all");
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});

  // MapLibre needs `window` and WebGL, so it is imported only in the browser.
  // The container renders on the server as an empty box and fills in once it
  // comes near the screen: the library is ~430 KB gzipped, and most phones
  // opening the page for the price never scroll this far.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const [ml, worker, style] = await Promise.all([
        import("maplibre-gl"),
        // Vite bundles the worker with the code it imports and returns its URL;
        // MapLibre's own lookup expects files Vite has moved.
        import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
        loadStyle(),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      const el = containerRef.current;
      if (cancelled || !el || mapRef.current) return;
      ml.setWorkerUrl(worker.default);

      const [[south, west], [north, east]] = mapArea.bounds;
      const lats = mapPoints.map((p) => p.lat);
      const lngs = mapPoints.map((p) => p.lng);

      const map = new ml.Map({
        container: el,
        style,
        // Open at the tightest view that still shows every pin, so the village
        // cluster spreads out as far as each screen width allows.
        bounds: [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        fitBoundsOptions: { padding: 28, maxZoom: mapArea.fitMaxZoom },
        maxBounds: [
          [west, south],
          [east, north],
        ],
        minZoom: mapArea.minZoom,
        maxZoom: mapArea.maxZoom,
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      map.addControl(new ml.NavigationControl({ showCompass: false }), "top-left");

      for (const p of mapPoints) {
        const kind = kindOf(p.kind);
        const pin = document.createElement("button");
        pin.type = "button";
        pin.title = p.name;
        pin.setAttribute("aria-label", p.name);
        pin.style.cssText = "background:none;border:0;padding:0;cursor:pointer;";
        pin.innerHTML = markerHtml(kind.color, kind.icon);
        // Clicking a pin opens a small popup with the place's name, which links
        // to it in Google Maps. MapLibre toggles it on the marker click itself.
        const link = document.createElement("a");
        link.href = googleMapsUrl(p.name);
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = p.name;
        link.style.cssText = "font-weight:600;color:#1d4ed8;text-decoration:underline;";
        const popup = new ml.Popup({
          offset: 20,
          closeButton: false,
          maxWidth: "220px",
        }).setDOMContent(link);
        markersRef.current[p.name] = new ml.Marker({ element: pin })
          .setLngLat([p.lng, p.lat])
          .setPopup(popup)
          .addTo(map);
      }

      mapRef.current = map;
      setReady(true);
    };

    const box = containerRef.current;
    if (!box) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        void init();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(box);

    return () => {
      cancelled = true;
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Keep pins in step with the filter.
  useEffect(() => {
    if (!ready) return;
    for (const p of mapPoints) {
      const marker = markersRef.current[p.name];
      if (!marker) continue;
      const hidden = active !== "all" && p.kind !== active;
      marker.getElement().style.display = hidden ? "none" : "";
      if (hidden && marker.getPopup()?.isOpen()) marker.togglePopup();
    }
  }, [active, ready]);

  const legend = (
    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
      <button
        type="button"
        onClick={() => setActive("all")}
        className={`flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
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
          className={`flex items-center gap-2 flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
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
      <div className="grid gap-3">
        <div>
          <div
            ref={containerRef}
            aria-label="Map of Val Thorens showing where we stay, the lifts and the venues"
            className="relative z-0 h-[340px] w-full overflow-hidden rounded-lg border border-border bg-secondary sm:h-[420px]"
          />
          {legend}
        </div>
      </div>
    </div>
  );
}
