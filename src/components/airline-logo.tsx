import { Plane } from "lucide-react";

import { airlineLogo, type LogoDirection } from "@/lib/airline-logos";
import { airlineForNumber } from "@/lib/flight-suggestions";
import { cn } from "@/lib/utils";

// The airline's logo for a flight number, or a plane tile when we don't
// have the logo. Decorative: the airline name is already in the text beside it.
export function AirlineLogo({
  number,
  direction,
  airline,
  className,
}: {
  number: string;
  direction: LogoDirection;
  airline?: string | undefined;
  className?: string;
}) {
  // Saved flights carry only the number, so find the airline in the list.
  const name = airline ?? airlineForNumber(number, direction);
  const { known, logo } = airlineLogo(number, direction, name);
  if (!known) return null;

  // Every logo sits centred in the same 80px slot, a little smaller than the
  // slot so wide logos keep a margin on both sides.
  return (
    <span aria-hidden="true" className={cn("grid h-6 w-20 shrink-0 place-items-center", className)}>
      {logo ? (
        <img
          src={logo.src}
          alt=""
          loading="lazy"
          className="max-h-[1.3rem] max-w-[4.25rem] object-contain"
        />
      ) : (
        <span className="grid h-6 w-10 place-items-center rounded bg-secondary text-muted-foreground">
          <Plane className="size-3.5" />
        </span>
      )}
    </span>
  );
}
