import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { packing } from "@/lib/trip";

const STORAGE_KEY = "vt2027-packing";

export function PackingList() {
  const [checked, setChecked] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw) as string[]);
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore unwritable storage */
    }
  }, [checked, hydrated]);

  const total = packing.reduce((sum, group) => sum + group.items.length, 0);
  const done = hydrated ? checked.length : 0;

  const toggle = (item: string) =>
    setChecked((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
        <div>
          <p className="font-display text-2xl">
            {done} / {total} packed
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Your ticks stay on this device, so you can come back to it.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary" role="presentation">
            <div className="h-full bg-primary transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setChecked([])}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Reset
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {packing.map((group) => (
          <div key={group.group} className="rounded-lg border border-border bg-background p-5">
            <h3 className="text-lg uppercase">{group.group}</h3>
            <ul className="mt-4 space-y-1">
              {group.items.map((item) => {
                const isChecked = hydrated && checked.includes(item);
                return (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm leading-relaxed hover:bg-secondary/50">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item)}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span className={isChecked ? "text-muted-foreground line-through" : ""}>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
