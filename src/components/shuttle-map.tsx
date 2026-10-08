import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExpressionSpecification, Map as MapLibreMap, Marker } from "maplibre-gl";

import { loadStyle } from "@/components/map-style";
import { markerHtml } from "@/lib/map-glyphs";
import { shuttleRoutes, walkRoutes } from "@/lib/shuttle-route";
import { gettingAround, mapArea, mapKinds, mapPoints } from "@/lib/trip";

const { shuttle, valley } = gettingAround;

type Loop = (typeof shuttle.loops)[number];
type Active = "all" | Loop["id"];

const HUB_COLOR = "#14232B";
const stayKind = mapKinds.find((k) => k.id === "stay")!;

// What is drawn for each stay: its pin, the stop the brochure lists it under,
// and the two positions. Looked up once, so a rename in trip.ts fails loudly.
const stays = shuttle.stays.map((s) => {
  const pin = mapPoints.find((p) => p.name === s.pin);
  const stop = shuttle.loops.flatMap((l) => l.stops).find((st) => st.name === s.stop);
  if (!pin || !stop) throw new Error(`Getting around: no map position for ${s.name}`);
  return { ...s, pin, stop };
});

// Which loop each stop is on, for the dim-the-other-loop filter.
const stopPoints = [
  ...shuttle.loops.flatMap((l) => l.stops.map((s) => ({ ...s, loop: l.id, color: l.color }))),
  { ...shuttle.hub, loop: "hub" as const, color: HUB_COLOR },
];

// Our three places sit close together, so each label gets its own side of its pin.
const stayLabelSide: Record<string, "above" | "below" | "left" | "right"> = {
  "Hameau du Kashmir": "above",
  "Village Montana": "right",
  "L’Oxalys": "below",
};

function stayLabelStyle(side: "above" | "below" | "left" | "right"): string {
  const place = {
    above: "left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:3px;",
    below: "left:50%;top:100%;transform:translateX(-50%);margin-top:3px;",
    left: "right:100%;top:50%;transform:translateY(-50%);margin-right:5px;",
    right: "left:100%;top:50%;transform:translateY(-50%);margin-left:5px;",
  }[side];
  const halo = "0 0 2px #fff,0 0 2px #fff,0 0 3px #fff,0 0 3px #fff";
  return `position:absolute;${place}white-space:nowrap;pointer-events:none;font-weight:700;font-size:12.5px;line-height:1.1;color:#1d4ed8;text-shadow:${halo};`;
}

const lngLat = ([lat, lng]: [number, number]): [number, number] => [lng, lat];

function stopDot(loop: Loop["id"] | "hub", color: string): HTMLDivElement {
  const el = document.createElement("div");
  // West stops are round and east stops square, so the loops differ by shape
  // as well as colour. The bus station is bigger and dark.
  const size = loop === "hub" ? 20 : 14;
  const radius = loop === "east" ? "4px" : "9999px";
  el.style.cssText = `width:${size}px;height:${size}px;border-radius:${radius};background:${color};border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(20,35,43,.35);box-sizing:border-box;`;
  return el;
}

export function ShuttleMap() {
  const [active, setActive] = useState<Active>("all");
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const dotsRef = useRef<Array<{ marker: Marker; loop: string }>>([]);

  // Same lazy start as the town map: MapLibre is heavy and only runs in the
  // browser, so it loads once this box nears the screen.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const [ml, worker, style] = await Promise.all([
        import("maplibre-gl"),
        import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
        loadStyle(),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      const el = containerRef.current;
      if (cancelled || !el || mapRef.current) return;
      ml.setWorkerUrl(worker.default);

      const [[south, west], [north, east]] = mapArea.bounds;
      // Frame the stops and our places, not the whole line: its far west end
      // is a turnaround nobody needs, and leaving it out zooms in a notch.
      const points = [
        ...stopPoints.map((s) => [s.lng, s.lat] as [number, number]),
        ...stays.map((s) => [s.pin.lng, s.pin.lat] as [number, number]),
      ];
      const lngs = points.map((p) => p[0]);
      const lats = points.map((p) => p[1]);

      const map = new ml.Map({
        container: el,
        style,
        bounds: [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        fitBoundsOptions: {
          // Room on the left for our places' labels, and under the valley-bus chip.
          padding: { top: 56, right: 48, bottom: 24, left: 76 },
          maxZoom: mapArea.maxZoom,
        },
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

      map.on("load", () => {
        if (cancelled) return;

        // Lines go under the street names, so the names stay readable.
        const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id;

        map.addSource("shuttle-routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: shuttle.loops.map((l) => ({
              type: "Feature",
              properties: { id: l.id, color: l.color },
              geometry: { type: "LineString", coordinates: shuttleRoutes[l.id].map(lngLat) },
            })),
          },
        });
        map.addLayer(
          {
            id: "shuttle-casing",
            type: "line",
            source: "shuttle-routes",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 8.5, "line-opacity": 0.95 },
          },
          firstLabel,
        );
        map.addLayer(
          {
            id: "shuttle-line",
            type: "line",
            source: "shuttle-routes",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": ["get", "color"], "line-width": 4.5 },
          },
          firstLabel,
        );

        // Small chevrons along each line, pointing the way the bus goes. The
        // lines are stored in travel order, so the line's direction is the
        // bus's. Drawn once as a mask, then tinted in each loop's own colour and
        // edged in white, so they stand out from the line they sit on.
        const chevron = document.createElement("canvas");
        chevron.width = chevron.height = 24;
        const ctx = chevron.getContext("2d");
        if (ctx) {
          ctx.lineWidth = 3.6;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(8, 5);
          ctx.lineTo(16, 12);
          ctx.lineTo(8, 19);
          ctx.stroke();
          map.addImage("shuttle-chevron", ctx.getImageData(0, 0, 24, 24), { sdf: true });
          map.addLayer(
            {
              id: "shuttle-arrows",
              type: "symbol",
              source: "shuttle-routes",
              layout: {
                "symbol-placement": "line",
                "symbol-spacing": 110,
                "icon-image": "shuttle-chevron",
                "icon-size": 0.72,
                "icon-rotation-alignment": "map",
                "icon-allow-overlap": true,
                "icon-ignore-placement": true,
              },
              paint: {
                "icon-color": ["get", "color"],
                "icon-halo-color": "#ffffff",
                "icon-halo-width": 1.5,
              },
            },
            firstLabel,
          );
        }

        // The walk from each place to its stop.
        map.addSource("shuttle-walks", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: stays.map((s) => ({
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: (
                  walkRoutes[s.name] ?? [
                    [s.pin.lat, s.pin.lng],
                    [s.stop.lat, s.stop.lng],
                  ]
                ).map(lngLat),
              },
            })),
          },
        });
        map.addLayer({
          id: "shuttle-walks",
          type: "line",
          source: "shuttle-walks",
          layout: { "line-cap": "round" },
          paint: {
            "line-color": stayKind.color,
            "line-width": 2.5,
            "line-dasharray": [0.5, 2],
          },
        });

        // Stop names, as map text so they dodge each other as the map zooms.
        map.addSource("shuttle-labels", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              ...stopPoints.map((s) => ({
                type: "Feature" as const,
                properties: { name: s.name, loop: s.loop },
                geometry: { type: "Point" as const, coordinates: [s.lng, s.lat] },
              })),
            ],
          },
        });
        map.addLayer({
          id: "shuttle-stop-labels",
          type: "symbol",
          source: "shuttle-labels",
          filter: ["!=", ["get", "loop"], "stay"],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 11.5,
            "text-variable-anchor": ["top", "bottom", "right", "left"],
            "text-radial-offset": 1,
            "text-padding": 2,
          },
          paint: {
            "text-color": "#14232B",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.8,
          },
        });

        // Dots, as page elements so they can be round or square.
        for (const s of stopPoints) {
          const marker = new ml.Marker({ element: stopDot(s.loop, s.color) })
            .setLngLat([s.lng, s.lat])
            .addTo(map);
          marker.getElement().style.zIndex = s.loop === "hub" ? "2" : "1";
          dotsRef.current.push({ marker, loop: s.loop });
        }
        for (const s of stays) {
          // The pin and its name travel together, so a lifted pin keeps its label.
          const pin = document.createElement("div");
          pin.style.cssText = "width:28px;height:28px;z-index:3;";
          pin.innerHTML = markerHtml(stayKind.color, "house", "#fff", "#fff", 28);
          const label = document.createElement("span");
          label.textContent = s.name;
          label.style.cssText = stayLabelStyle(stayLabelSide[s.name] ?? "above");
          pin.appendChild(label);
          pin.setAttribute("role", "img");
          pin.setAttribute("aria-label", s.name);
          // A place right beside its stop would hide the stop's dot, so its pin
          // is lifted clear of it; the dotted walk still starts at the true spot.
          const metres = Math.hypot(
            (s.pin.lat - s.stop.lat) * 111000,
            (s.pin.lng - s.stop.lng) * 78000,
          );
          new ml.Marker({ element: pin, offset: metres < 40 ? [0, -26] : [0, 0] })
            .setLngLat([s.pin.lng, s.pin.lat])
            .addTo(map);
        }

        setReady(true);
      });

      mapRef.current = map;
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
      dotsRef.current = [];
    };
  }, []);

  // Pick a loop to fade the other one out.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const on = (id: string) => active === "all" || active === id;
    const faded: ExpressionSpecification = ["case", ["==", ["get", "id"], active], 1, 0.18];
    map.setPaintProperty("shuttle-line", "line-opacity", active === "all" ? 1 : faded);
    map.setPaintProperty("shuttle-casing", "line-opacity", active === "all" ? 0.95 : faded);
    if (map.getLayer("shuttle-arrows")) {
      map.setPaintProperty("shuttle-arrows", "icon-opacity", active === "all" ? 1 : faded);
    }
    map.setFilter(
      "shuttle-stop-labels",
      active === "all"
        ? ["!=", ["get", "loop"], "stay"]
        : ["any", ["==", ["get", "loop"], "hub"], ["==", ["get", "loop"], active]],
    );
    for (const { marker, loop } of dotsRef.current) {
      marker.getElement().style.opacity = loop === "hub" || on(loop) ? "1" : "0.25";
    }
  }, [active, ready]);

  const chip = (selected: boolean) =>
    `flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
      selected
        ? "border-foreground bg-foreground text-background"
        : "border-border hover:border-foreground"
    }`;

  return (
    <div>
      <div className="relative">
        <div
          ref={containerRef}
          aria-label="Map of the free shuttle in Val Thorens, with its two loops, its stops and where we stay"
          className="relative z-0 h-[420px] w-full overflow-hidden rounded-lg border border-border bg-secondary sm:h-[460px]"
        />
        <p className="pointer-events-none absolute right-2 top-2 z-10 flex max-w-[9.5rem] items-start gap-1.5 rounded-lg border border-border bg-card/95 px-2 py-1 text-[0.7rem] leading-snug shadow-sm sm:max-w-[13rem] sm:text-xs">
          <ArrowLeft className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            <b className="font-semibold">{valley.mapLabel}</b>
            <span className="block text-muted-foreground">{valley.mapNote}</span>
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <button type="button" onClick={() => setActive("all")} className={chip(active === "all")}>
          Both loops
        </button>
        {shuttle.loops.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setActive(l.id)}
            aria-pressed={active === l.id}
            className={chip(active === l.id)}
          >
            <span
              className={`size-2.5 ${l.id === "east" ? "rounded-[2px]" : "rounded-full"}`}
              style={{ background: l.color }}
              aria-hidden="true"
            />
            {l.name}
          </button>
        ))}
        <span className="flex min-h-8 items-center gap-2 px-2 text-xs font-medium">
          <span
            className="size-2.5 rounded-full"
            style={{ background: stayKind.color }}
            aria-hidden="true"
          />
          Where we stay
        </span>
      </div>
    </div>
  );
}
