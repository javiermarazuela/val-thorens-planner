import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { FlightForm } from "@/components/flight-form";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/use-session";
import { site } from "@/lib/trip";

export const Route = createFileRoute("/members")({
  // The session lives in the browser, so render on the client only. The data
  // itself is protected by row level security, not by hiding this page.
  ssr: false,
  head: () => ({ meta: [{ title: "Members — Euro Ski ’27" }] }),
  component: Members,
});

type MemberLink = { id: number; label: string; url: string };

function Members() {
  const { supabase, session, authError, signIn } = useSession();
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const error = loadError ?? authError;

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("member_links")
      .select("id,label,url")
      .order("sort")
      .then(({ data, error: err }) => {
        if (err) setLoadError("Couldn't load the members area.");
        else setLinks((data as MemberLink[] | null) ?? []);
      });
  }, [supabase, session]);

  if (!supabase) {
    return (
      <Shell>
        <p>Login isn't switched on for this deploy yet.</p>
      </Shell>
    );
  }
  if (session === undefined) {
    return (
      <Shell>
        <p className="text-muted-foreground">Loading…</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <p>Sign in with your Columbia Google account to see the WhatsApp group and the rest.</p>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
        <Button className="mt-5" onClick={signIn}>
          Sign in with Google
        </Button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-muted-foreground">Signed in as {session.user.email}</p>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <ul className="mt-5 grid gap-2">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-md border border-border px-4 py-3 font-bold hover:bg-secondary"
            >
              {link.label}
            </a>
          </li>
        ))}
        {links.length === 0 && !error && <li className="text-muted-foreground">Coming soon.</li>}
      </ul>
      <div className="mt-8 border-t border-border pt-8">
        <h2 className="mb-4 font-display text-2xl uppercase">Your flights</h2>
        <FlightForm supabase={supabase} session={session} />
      </div>
      <Button variant="outline" className="mt-8" onClick={() => supabase.auth.signOut()}>
        Sign out
      </Button>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <a
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to {site.name}
      </a>
      <h1 className="font-display text-3xl uppercase">Members</h1>
      <div className="mt-4">{children}</div>
    </section>
  );
}
