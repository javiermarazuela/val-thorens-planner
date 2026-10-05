import { ExternalLink } from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { contacts, trouble } from "@/lib/trip";

const card = "flex flex-col rounded-2xl border-[1.5px] border-paper/55 p-5";
const small = "text-xs font-bold uppercase tracking-[0.14em]";

export function Trouble({ n }: SectionProps) {
  const { emergency, doctor, pharmacy } = trouble;

  return (
    <GuideSection id="trouble" n={n} tone="alert" title={trouble.title}>
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href={emergency.href}
          className="flex min-h-11 flex-col gap-1 rounded-2xl bg-paper p-5 text-alert no-underline"
        >
          <span className={small}>{emergency.label}</span>
          <span className="font-display text-7xl leading-[0.9] sm:text-8xl">
            {emergency.number}
          </span>
          <span className="text-sm text-ink/70">{emergency.note}</span>
        </a>

        {[doctor, pharmacy].map((p) => (
          <div key={p.name} className={card}>
            <span className={small}>{p.label}</span>
            <span className="mt-1 text-xl font-bold">{p.name}</span>
            <span className="text-sm opacity-90">{p.address}</span>
            <p className="mt-3 flex-1 text-sm leading-relaxed">{p.body}</p>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold underline underline-offset-4 hover:no-underline"
            >
              {p.linkLabel}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-2xl text-base leading-relaxed">{trouble.insurance}</p>
      <p className="mt-4 text-xl font-semibold">{contacts.body}</p>
    </GuideSection>
  );
}
