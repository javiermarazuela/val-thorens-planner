import { GuideSection } from "@/components/guide-section";
import type { SectionProps } from "@/components/sections/registry";
import { TodayCard } from "@/components/sections/today-card";

export function DailyPlan({ n, tone }: SectionProps) {
  return (
    <GuideSection id="daily-plan" n={n} tone={tone} title="Today’s plan">
      <TodayCard />
    </GuideSection>
  );
}
