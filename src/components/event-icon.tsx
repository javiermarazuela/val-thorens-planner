import {
  Beer,
  Disc3,
  Luggage,
  Martini,
  Plane,
  Snowflake,
  Wine,
  type LucideIcon,
} from "lucide-react";

import type { EventIcon as EventIconKey } from "@/lib/trip";

const icons: Record<EventIconKey, LucideIcon> = {
  arrivals: Plane,
  departures: Luggage,
  snow: Snowflake,
  welcome: Wine,
  apres: Martini,
  bar: Beer,
  club: Disc3,
  lastnight: Wine,
};

export function EventIcon({ icon }: { icon: EventIconKey }) {
  const Icon = icons[icon];
  return <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />;
}
