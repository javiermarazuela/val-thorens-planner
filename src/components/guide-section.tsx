import type { ReactNode } from "react";

import { GradeMark } from "@/components/guide-nav";
import { sectionMeta, type SectionId } from "@/lib/trip";

export type Tone = "paper" | "mint" | "alert";

const tones: Record<Tone, string> = {
  paper: "bg-transparent",
  mint: "border-y border-border bg-mint/80",
  alert: "bg-alert text-paper",
};

// The shell every guide section sits in: its band, its number badge (same
// shape and colour as its stop on the trail) and a left-aligned heading.
export function GuideSection({
  id,
  n,
  tone,
  title,
  intro,
  children,
}: {
  id: SectionId;
  n: string;
  tone: Tone;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--header-h)] py-12 sm:py-16 lg:py-24 ${tones[tone]}`}
    >
      <div className="mx-auto max-w-5xl px-5 xl:max-w-6xl">
        <div className="flex items-center gap-4">
          <GradeMark grade={sectionMeta[id].grade} n={n} state="current" size="lg" />
          <h2 className="text-3xl uppercase leading-none sm:text-5xl">{title}</h2>
        </div>
        {intro && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>
        )}
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  );
}
