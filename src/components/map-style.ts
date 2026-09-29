import type { MapOptions } from "maplibre-gl";

export type StyleInput = NonNullable<MapOptions["style"]>;

type Layer = {
  id: string;
  type: string;
  paint?: Record<string, unknown>;
} & Record<string, unknown>;

// OpenFreeMap's Positron: a pale, low-detail vector style with no POI layer,
// free and keyless. It is fetched and repainted for winter before the map
// draws. The labels below add nothing at resort scale (rivers and lakes, road
// shields, airports), so they are dropped. Street and place names stay, for
// finding your way.
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
const HIDDEN_LABELS = /^(waterway_line_label|water_name_|highway-shield|road_shield|airport)/;

// Winter palette, in the spirit of Google Maps but for January: cool
// blue-whites for the snow, with rock a shade darker so the mountain still
// has shape; blue water; a warm village so it reads apart from the snow.
const PALETTE = {
  snow: "#f4f8fc",
  snowfield: "#eaf2fa",
  rock: "#d5dfea",
  glacier: "#ffffff",
  lake: "#9ccbee",
  stream: "#5fa8e0",
  village: "#f3ede4",
  building: "#e4d9c9",
  buildingOutline: "#d2c4b0",
  street: "#c9d3df",
  path: "#d8dfe8",
  // Deep pink-red, close to Google's lifts: about 5:1 against the snow, and a
  // different hue from every pin, including the brick-red Drinks & bars.
  lift: "#c81e64",
};

// Paint changes to Positron's own layers, by id. A layer Positron renames is
// skipped rather than breaking the map.
const REPAINT: Record<string, Record<string, unknown>> = {
  background: { "background-color": PALETTE.snow },
  // The Vanoise national park zone covers the whole map; Positron fills it
  // grey, which is most of the grey haze.
  park: { "fill-opacity": 0 },
  landcover_glacier: { "fill-color": PALETTE.glacier, "fill-opacity": 1 },
  water: { "fill-color": PALETTE.lake },
  waterway: {
    "line-color": PALETTE.stream,
    "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 17, 2.5],
  },
  landuse_residential: { "fill-color": PALETTE.village, "fill-opacity": 1 },
  building: { "fill-color": PALETTE.building, "fill-outline-color": PALETTE.buildingOutline },
  highway_minor: { "line-color": PALETTE.street },
  highway_path: { "line-color": PALETTE.path },
};

// Positron doesn't draw grass or rock; the tiles carry both. Under snow,
// grassland is smooth snowfield and bare rock and scree show through darker.
function landcover(id: string, cls: string, color: string): Layer {
  return {
    id,
    type: "fill",
    source: "openmaptiles",
    "source-layer": "landcover",
    filter: ["==", ["get", "class"], cls],
    paint: { "fill-color": color },
  };
}

// Positron doesn't draw ski lifts either, but the tiles carry them
// (OpenMapTiles' transportation class "aerialway"), with their names. The
// tiles have no "VT3"-style numbers, so labels are names only.
const LIFT_LINES: Layer = {
  id: "aerialway",
  type: "line",
  source: "openmaptiles",
  "source-layer": "transportation",
  filter: ["==", ["get", "class"], "aerialway"],
  layout: { "line-cap": "round" },
  paint: {
    "line-color": PALETTE.lift,
    "line-width": ["interpolate", ["linear"], ["zoom"], 13, 1.2, 17, 2.5],
  },
};

const LIFT_LABELS: Layer = {
  id: "aerialway_label",
  type: "symbol",
  source: "openmaptiles",
  "source-layer": "transportation_name",
  minzoom: 13,
  filter: ["==", ["get", "class"], "aerialway"],
  layout: {
    "symbol-placement": "line",
    "text-field": ["get", "name"],
    "text-font": ["Noto Sans Bold"],
    "text-size": 11,
    "text-letter-spacing": 0.02,
  },
  paint: { "text-color": PALETTE.lift, "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
};

export async function loadStyle(): Promise<StyleInput> {
  try {
    const res = await fetch(STYLE_URL);
    if (!res.ok) return STYLE_URL;
    const style = (await res.json()) as { layers: Layer[] };
    const layers = style.layers.filter((layer) => !HIDDEN_LABELS.test(layer.id));

    for (const layer of layers) {
      const paint = REPAINT[layer.id];
      if (paint) layer.paint = { ...layer.paint, ...paint };
    }

    // Snow and rock go straight after the park layer (or the background, if
    // Positron drops it), so water, the village and buildings draw on top.
    const park = layers.findIndex((layer) => layer.id === "park");
    const background = layers.findIndex((layer) => layer.id === "background");
    layers.splice(
      (park === -1 ? background : park) + 1,
      0,
      landcover("landcover_snowfield", "grass", PALETTE.snowfield),
      landcover("landcover_rock", "rock", PALETTE.rock),
    );

    // Lift lines go under the first label layer, so names stay on top; lift
    // names go last, so they win a label collision.
    const firstLabel = layers.findIndex((layer) => layer.type === "symbol");
    layers.splice(firstLabel === -1 ? layers.length : firstLabel, 0, LIFT_LINES);
    layers.push(LIFT_LABELS);

    style.layers = layers;
    return style as unknown as StyleInput;
  } catch {
    // Fall back to the unstyled Positron rather than no map at all.
    return STYLE_URL;
  }
}
