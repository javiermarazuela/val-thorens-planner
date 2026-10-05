import { useState } from "react";
import { ExternalLink } from "lucide-react";

import faqImage from "@/assets/val-thorens-guide.jpg";
import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { StatusBadge } from "@/components/status-badge";
import { faqSection, faqs } from "@/lib/trip";

const shown = faqs.filter((f) => !f.archived);

export function Faqs({ n, tone }: SectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <GuideSection id="faqs" n={n} tone={tone} title={faqSection.title}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="border-t-[1.5px] border-ink">
          {shown.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-10 w-full items-center gap-3 py-2 text-left text-base font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex-1">{faq.q}</span>
                  <StatusBadge status={faq.status} />
                  <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-xl ${isOpen ? "bg-ink text-paper" : "bg-card text-ink"}`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-3 pr-12">
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {faq.a}
                    </p>
                    {faq.link && (
                      <a
                        href={faq.link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-bold text-primary"
                      >
                        {faq.link.label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <figure className="hidden overflow-hidden rounded-2xl lg:block">
          <img
            src={faqImage}
            alt="Four skiers in blue jackets studying the piste map at the top of the mountain"
            width={1200}
            height={1600}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </GuideSection>
  );
}
