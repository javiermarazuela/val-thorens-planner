import { ExternalLink } from "lucide-react";

import { GuideSection } from "@/components/guide-section";
import { ResortMap } from "@/components/resort-map";
import type { SectionProps } from "@/components/sections/registry";
import { mapSection } from "@/lib/trip";

const smallTitle = "text-sm font-bold uppercase tracking-[0.16em]";

// Town map and ski map side by side on a wide screen, one above the other on a phone.
export function Maps({ n, tone }: SectionProps) {
  return (
    <GuideSection id="maps" n={n} tone={tone} title={mapSection.title}>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-8">
        <div>
          <h3 className={smallTitle}>{mapSection.townMapTitle}</h3>
          <div className="mt-3">
            <ResortMap />
          </div>
        </div>

        <div>
          <h3 className={smallTitle}>{mapSection.pisteMapsTitle}</h3>
          <a
            href={mapSection.pisteMapImage}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block overflow-hidden rounded-lg border border-border"
          >
            <img
              src={mapSection.pisteMapImage}
              alt={mapSection.pisteMapAlt}
              width={3198}
              height={2409}
              loading="lazy"
              className="h-auto w-full"
            />
          </a>
          <p className="mt-2 text-xs text-muted-foreground">{mapSection.pisteMapHint}</p>
          <p className="mt-4 flex flex-col gap-1 text-sm">
            {mapSection.pisteMapDownloads.map((m) => (
              <a
                key={m.file}
                href={m.file}
                download
                className="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-4 hover:no-underline"
              >
                {m.label}
              </a>
            ))}
            <a
              href={mapSection.officialMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary underline underline-offset-4 hover:no-underline"
            >
              {mapSection.officialMapLabel}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{mapSection.pisteMapsNote}</p>
        </div>
      </div>
    </GuideSection>
  );
}
