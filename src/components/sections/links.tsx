import { ExternalLink } from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import { PackingList } from "@/components/packing-list";
import type { SectionProps } from "@/components/sections/registry";
import { linksSection, mountain } from "@/lib/trip";

const links = [...mountain.links, linksSection.officialSite];

export function Links({ n, tone }: SectionProps) {
  return (
    <GuideSection id="links" n={n} tone={tone} title={linksSection.title}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em]">
            {linksSection.linksTitle}
          </h3>
          <ul className="mt-3 border-t-[1.5px] border-ink">
            {links.map((link) => (
              <li key={link.href} className="border-b border-border">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-14 items-center justify-between gap-3 text-lg font-bold"
                >
                  {link.label}
                  <ExternalLink className="size-4 text-primary" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em]">
            {linksSection.packingTitle}
          </h3>
          <div className="mt-3">
            <PackingList />
          </div>
        </div>
      </div>
    </GuideSection>
  );
}
