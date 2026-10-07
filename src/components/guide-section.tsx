import type { ReactNode } from "react";

import { GradeMark } from "@/components/guide-nav";
import { sectionMeta, type SectionId } from "@/lib/trip";

export type Tone = "paper" | "mint" | "alert";

const tones: Record<Tone, string> = {
  paper: "border-t border-border bg-transparent",
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
  children,
}: {
  id: SectionId;
  n: string;
  tone: Tone;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-[var(--header-h)] py-8 sm:py-10 lg:py-14 ${tones[tone]}`}
    >
      <div className="mx-auto max-w-5xl px-5 xl:max-w-6xl">
        <div className="flex items-center gap-3">
          <GradeMark grade={sectionMeta[id].grade} n={n} state="current" size="md" />
          <h2 className="text-xl font-bold leading-none sm:text-2xl">{title}</h2>
        </div>
        <div className="mt-5 sm:mt-6">{children}</div>
      </div>
    </section>
  );
}
