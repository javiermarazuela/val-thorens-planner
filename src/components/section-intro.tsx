import type { ReactNode } from "react";

// One centred title per section, with an optional short line under it.
export function SectionIntro({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="text-3xl uppercase leading-tight sm:text-4xl">{title}</h2>
      {intro && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{intro}</p>
      )}
    </div>
  );
}
