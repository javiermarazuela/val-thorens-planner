// Julian, the snowman who answers questions about the trip.
export function Julian({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Julian the snowman"
      className={className}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* body and head */}
      <circle cx="24" cy="38" r="9" className="fill-card stroke-ink" strokeWidth="2" />
      <circle cx="24" cy="21" r="9.5" className="fill-card stroke-ink" strokeWidth="2" />
      {/* beanie with a pom-pom */}
      <path
        d="M14.6 18.5a9.4 9.4 0 0 1 18.8 0z"
        className="fill-signal stroke-ink"
        strokeWidth="2"
      />
      <circle cx="24" cy="8" r="2.6" className="fill-mustard stroke-ink" strokeWidth="1.6" />
      {/* face */}
      <circle cx="20.3" cy="22" r="1.3" className="fill-ink" />
      <circle cx="27.7" cy="22" r="1.3" className="fill-ink" />
      <path d="M24 24.2 31 26l-7 1.2z" className="fill-flame stroke-ink" strokeWidth="1.4" />
      {/* scarf */}
      <path
        d="M15 31.2q9 4 18 0l.8 3.6q-9.8 4-19.6 0z"
        className="fill-mustard stroke-ink"
        strokeWidth="2"
      />
      <path d="M29 34.6 31 42l-4 .6-1-6.2z" className="fill-mustard stroke-ink" strokeWidth="1.8" />
      {/* buttons */}
      <circle cx="21.5" cy="40" r="1" className="fill-ink" />
      <circle cx="21.5" cy="44" r="1" className="fill-ink" />
    </svg>
  );
}
