import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { CrewFlights } from "@/components/crew-flights";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/lib/social/source";
import { site } from "@/lib/trip";

// Members only. The session lives in the browser, so render on the client only;
// the data is protected by row level security and security-definer functions.
export const Route = createFileRoute("/crew")({
  ssr: false,
  head: () => ({
    meta: [{ title: `Crew · ${site.title}` }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Crew,
});

function Crew() {
  const social = useSocial();

  if (social.status === "loading") {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  if (social.status === "unavailable") {
    return (
      <Shell>
        <p>The crew pages aren't available right now. Try again in a moment.</p>
      </Shell>
    );
  }
  if (social.status === "signed-out") {
    return (
      <Shell>
        <p>Sign in with your Columbia Google account to see who is travelling with you.</p>
        {social.signIn && (
          <Button className="mt-5" onClick={social.signIn}>
            Sign in with Google
          </Button>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <label className="flex items-start gap-3 rounded-md border border-border p-4">
        <input
          type="checkbox"
          className="mt-1 size-4"
          checked={social.visible}
          onChange={(e) => void social.setVisible(e.target.checked)}
        />
        <span>
          <span className="block font-bold">Show me to other members</span>
          <span className="block text-sm text-muted-foreground">
            Other members can see your name next to your flight. Untick to hide yourself.
          </span>
        </span>
      </label>
      <div className="mt-6">
        <CrewFlights mates={social.mates} />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <a
        href="/members"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to members
      </a>
      <h1 className="font-display text-3xl uppercase">Crew</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
