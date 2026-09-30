import { createFileRoute } from "@tanstack/react-router";

import { privacy, site } from "@/lib/trip";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: `${privacy.title} — ${site.name}` }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl uppercase">{privacy.title}</h1>
      <p className="mt-4">{privacy.intro}</p>
      <ul className="mt-5 grid list-disc gap-3 pl-5">
        {privacy.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
