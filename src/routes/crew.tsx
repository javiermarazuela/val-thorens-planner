import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState, type ReactNode } from "react";

import { CrewFlights } from "@/components/crew-flights";
import { CrewSlopes } from "@/components/crew-slopes";
import { CrewTeams } from "@/components/crew-teams";
import { Button } from "@/components/ui/button";
import { initialSlopeDay, slopesNow } from "@/lib/social/slopes-content";
import { useSlopes, useSocial, useTeams } from "@/lib/social/source";
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

type Tab = "teams" | "slopes" | "flights";

const tabLabels: Record<Tab, string> = { teams: "Teams", slopes: "Slopes", flights: "Flights" };

function Crew() {
  const [tab, setTab] = useState<Tab>(() => {
    const hash = window.location.hash.replace("#", "");
    return hash === "flights" || hash === "slopes" ? hash : "teams";
  });
  const choose = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  return (
    <Shell>
      <div role="tablist" className="mb-6 flex gap-2">
        {(["teams", "slopes", "flights"] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => choose(id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold uppercase ${
              tab === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-secondary"
            }`}
          >
            {tabLabels[id]}
          </button>
        ))}
      </div>
      {tab === "teams" ? <TeamsTab /> : tab === "slopes" ? <SlopesTab /> : <FlightsTab />}
    </Shell>
  );
}

type Gate = {
  status: "loading" | "signed-out" | "signed-in" | "unavailable";
  signIn: (() => void) | null;
};

/** The same loading, sign-in and error screens for every tab. */
function Gated({ state, children }: { state: Gate; children: ReactNode }) {
  if (state.status === "loading") return <p className="text-muted-foreground">Loading…</p>;
  if (state.status === "unavailable") {
    return <p>The crew pages aren't available right now. Try again in a moment.</p>;
  }
  if (state.status === "signed-out") {
    return (
      <>
        <p>Sign in with your Columbia Google account to see your crew.</p>
        {state.signIn && (
          <Button className="mt-5" onClick={state.signIn}>
            Sign in with Google
          </Button>
        )}
      </>
    );
  }
  return <>{children}</>;
}

function TeamsTab() {
  const teams = useTeams();
  return (
    <Gated state={teams}>
      <CrewTeams state={teams} />
    </Gated>
  );
}

function SlopesTab() {
  const [day, setDay] = useState(() => initialSlopeDay(slopesNow()));
  const slopes = useSlopes(day);
  return (
    <Gated state={slopes}>
      <CrewSlopes state={slopes} day={day} onDay={setDay} />
    </Gated>
  );
}

function FlightsTab() {
  const social = useSocial();
  return (
    <Gated state={social}>
      <CrewFlights mates={social.mates} />
      <label className="mt-10 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <input
          type="checkbox"
          className="size-3.5"
          checked={!social.visible}
          onChange={(e) => void social.setVisible(!e.target.checked)}
        />
        Hide me from other members
      </label>
    </Gated>
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
