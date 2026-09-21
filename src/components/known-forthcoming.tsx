import { Check, Clock } from "lucide-react";

export function KnownForthcoming({
  known,
  forthcoming,
  knownTitle = "What we know now",
  forthcomingTitle = "Still being decided",
}: {
  known: readonly string[];
  forthcoming: readonly string[];
  knownTitle?: string;
  forthcomingTitle?: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
          <Check className="size-4" aria-hidden="true" /> {knownTitle}
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed">
          {known.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      {forthcoming.length > 0 && (
        <div className="rounded-lg border-l-4 border-accent bg-secondary/60 p-5">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-accent-foreground">
            <Clock className="size-4" aria-hidden="true" /> {forthcomingTitle}
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-secondary-foreground">
            {forthcoming.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
