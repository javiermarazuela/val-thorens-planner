import { useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import { mapCategories, mapPoints, type MapCategory } from "@/lib/trip";

export function ResortMap() {
  const [active, setActive] = useState<MapCategory | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = mapPoints.filter((point) => active === "all" || point.category === active);
  const point = mapPoints.find((p) => p.name === selected) ?? null;
  const colorOf = (category: MapCategory) =>
    mapCategories.find((c) => c.id === category)?.color ?? "#2563eb";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
            active === "all"
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:border-foreground"
          }`}
        >
          Everything
        </button>
        {mapCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActive(category.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
              active === category.id
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            }`}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: category.color }}
              aria-hidden="true"
            />
            {category.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-secondary">
        <svg
          viewBox="0 0 100 78"
          className="h-auto w-full"
          role="img"
          aria-label="Schematic map of Val Thorens"
        >
          <defs>
            <linearGradient id="vt-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          <rect width="100" height="78" fill="url(#vt-sky)" />
          <path
            d="M0 34 L16 12 L30 30 L44 16 L58 32 L72 14 L88 30 L100 20 L100 78 L0 78 Z"
            fill="#cbd5e1"
          />
          <path d="M0 46 L20 30 L38 44 L56 32 L74 46 L100 34 L100 78 L0 78 Z" fill="#e2e8f0" />
          <path d="M0 66 L24 58 L50 64 L76 56 L100 64 L100 78 L0 78 Z" fill="#f1f5f9" />
          <path d="M30 78 L46 48 L52 48 L64 78 Z" fill="#ffffff" opacity="0.85" />
          <text x="3" y="75" fontSize="2.6" fill="#64748b">
            Val Thorens · 2,300m
          </text>

          {visible.map((p) => {
            const isSelected = selected === p.name;
            return (
              <g key={p.name} onClick={() => setSelected(p.name)} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 3.4 : 2.4}
                  fill={colorOf(p.category)}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="none"
                    stroke={colorOf(p.category)}
                    strokeWidth="0.6"
                    opacity="0.6"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {point ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="size-3 rounded-full"
              style={{ background: colorOf(point.category) }}
              aria-hidden="true"
            />
            <p className="font-semibold">{point.name}</p>
            <StatusBadge status={point.status} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.note}</p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Tap a dot to see what it is. Filter by colour above.
        </p>
      )}

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {visible.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              onClick={() => setSelected(p.name)}
              className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                selected === p.name ? "border-foreground" : "border-transparent hover:border-border"
              }`}
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: colorOf(p.category) }}
                aria-hidden="true"
              />
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
