import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Clock3 } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getGuideSection } from "@/lib/guide.functions";

export const Route = createFileRoute("/guide/$slug")({
  loader: async ({ params }) => {
    const section = await getGuideSection({ data: { slug: params.slug } });
    if (!section) throw notFound();
    return section;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.title} — Val Thorens 2027` : "Guide section unavailable — Val Thorens 2027" },
    { name: "description", content: loaderData?.summary ?? "Val Thorens 2027 attendee guide." },
    { property: "og:title", content: loaderData ? `${loaderData.title} — Val Thorens 2027` : "Guide section unavailable" },
    { property: "og:description", content: loaderData?.summary ?? "Val Thorens 2027 attendee guide." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: GuideSectionPage,
});

function GuideSectionPage() {
  const section = Route.useLoaderData();
  return (
    <div>
      <section className="border-b border-border bg-card py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5">
          <Link to="/guide" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All guide areas</Link>
          <div className="mt-10"><StatusBadge status={section.status} /><p className="mt-6 text-xs font-extrabold uppercase text-primary">{section.eyebrow}</p><h1 className="mt-3 max-w-4xl text-5xl uppercase leading-none sm:text-7xl">{section.title}</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{section.summary}</p></div>
          <p className="mt-8 flex items-center gap-2 text-xs font-bold text-muted-foreground"><Clock3 className="size-4" /> Updated {section.updated}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-5 py-14 lg:grid-cols-2">
        <div><h2 className="text-2xl uppercase">What we know</h2><ul className="mt-6 space-y-4">{section.known.map((item) => <li key={item} className="flex gap-3 border-t border-border pt-4"><Check className="mt-0.5 size-5 shrink-0 text-primary" /><span>{item}</span></li>)}</ul></div>
        {section.forthcoming.length > 0 && <div className="border-l-4 border-accent bg-card p-6"><p className="text-xs font-extrabold uppercase text-accent-foreground">Coming next</p><h2 className="mt-3 text-2xl uppercase">Still being confirmed</h2><ul className="mt-6 space-y-3 text-muted-foreground">{section.forthcoming.map((item) => <li key={item}>— {item}</li>)}</ul><p className="mt-8 text-sm text-muted-foreground">We’ll publish these details here once the committee has signed them off.</p></div>}
      </section>

      {section.links && <section className="border-y border-border bg-secondary py-12"><div className="mx-auto max-w-5xl px-5"><h2 className="text-2xl uppercase">Official links</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{section.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border bg-card p-5 font-bold hover:border-primary">{link.label}<ArrowUpRight className="size-5" /></a>)}</div>{section.note && <p className="mt-5 text-sm text-muted-foreground">{section.note}</p>}</div></section>}

      <div className="mx-auto max-w-5xl px-5 py-12"><Button asChild variant="outline"><Link to="/guide"><ArrowLeft className="size-4" /> Back to the guide</Link></Button></div>
    </div>
  );
}