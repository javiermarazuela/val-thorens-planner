import type { ComponentType } from "react";

import type { Tone } from "@/components/guide-section";
import { DailyPlan } from "@/components/sections/daily-plan";
import { Faqs } from "@/components/sections/faqs";
import { GettingAround } from "@/components/sections/getting-around";
import { GettingHere } from "@/components/sections/getting-here";
import { Links } from "@/components/sections/links";
import { Maps } from "@/components/sections/maps";
import { Schedule } from "@/components/sections/schedule";
import { Stay } from "@/components/sections/stay";
import { ThingsToDo } from "@/components/sections/things-to-do";
import { Trouble } from "@/components/sections/trouble";
import { Welcome } from "@/components/sections/welcome";
import type { SectionId } from "@/lib/trip";

// `n` is the section's number in the current order, `tone` its band.
export type SectionProps = { n: string; tone: Tone };

// Sections with a component. An id in the order lists with no entry here is
// simply skipped, so a later phase only has to add its component.
export const sectionComponents: Partial<Record<SectionId, ComponentType<SectionProps>>> = {
  welcome: Welcome,
  "daily-plan": DailyPlan,
  "getting-here": GettingHere,
  around: GettingAround,
  stay: Stay,
  schedule: Schedule,
  maps: Maps,
  todo: ThingsToDo,
  faqs: Faqs,
  trouble: Trouble,
  links: Links,
};
