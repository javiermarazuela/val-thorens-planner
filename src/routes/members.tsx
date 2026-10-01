import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase";
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
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // A rejected sign-up comes back on the URL as error_description.
    const params = new URLSearchParams(
      window.location.search + "&" + window.location.hash.replace("#", ""),
    );
    if (params.get("error_description")) {
      setError("That account isn't on the list. Use your Columbia Google account.");
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from("member_links")
      .select("id,label,url")
      .order("sort")
      .then(({ data, error: err }) => {
        if (err) setError("Couldn't load the members area.");
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
        <Button
          className="mt-5"
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/members`,
                queryParams: { prompt: "select_account" },
              },
            })
          }
        >
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
      <Button variant="outline" className="mt-6" onClick={() => supabase.auth.signOut()}>
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
