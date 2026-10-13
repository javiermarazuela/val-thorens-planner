import { ArrowLeft, Send, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { Julian } from "@/components/chat/julian";
import { pickEnvironment, type ChatEnvironment, type ChatIdentity } from "@/lib/chat/environment";
import { answer, makeBrain, type ChatBrain } from "@/lib/chat/reply";
import type { ChatLink, KbRow } from "@/lib/chat/types";
import { askJulian } from "@/lib/chat/ask.functions";
import { logChat, type LogEntry } from "@/lib/chat/log";
import { profileToText } from "@/lib/chat/profile-text";
import { appNow } from "@/lib/now";
import { cn } from "@/lib/utils";

// Julian's chat window: a floating button that opens a small panel (a full-width
// sheet on phones). Free tier only for now: suggestion chips, search over the
// knowledge rows, and answers from the person's own details.

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
  links: ChatLink[];
  signIn: boolean;
};

const quick = [
  { label: "What's next?", ask: "What's the next event?" },
  { label: "Where's my room?", ask: "Where is my room?" },
  { label: "My shuttle", ask: "What time is my shuttle?" },
  { label: "Tonight", ask: "What are the plans for tonight?" },
  { label: "What to pack", ask: "What should I pack?" },
  { label: "Something to do", ask: "What can I do today?" },
];

const greeting =
  "Hi, I'm Julian, the snowman who knows the trip. Ask me about your room, your coach, the plans or what to do, or tap an idea below.";

// Asks the server (Haiku) and turns its answer into text plus how to log it.
async function askAi(
  question: string,
  who: ChatIdentity,
  now: Date,
): Promise<{ text: string; area: string; outcome: LogEntry["outcome"] }> {
  try {
    const result = await askJulian({
      data: {
        question,
        accessToken: who.accessToken,
        testEmail: who.testEmail,
        profileText: profileToText(who.profile),
        nowIso: now.toISOString(),
      },
    });
    switch (result.kind) {
      case "answer":
        return {
          text: result.text,
          area: result.area,
          outcome: /whatsapp/i.test(result.text) ? "unknown" : "answered",
        };
      case "offtopic":
        return { text: result.text, area: "Off topic", outcome: "offtopic" };
      case "banned":
        return { text: result.text, area: "Off topic", outcome: "blocked" };
      case "limit":
        return { text: result.text, area: "Other", outcome: "limit" };
      case "login":
        return { text: result.text, area: "Other", outcome: "login_prompt" };
      default:
        return { text: result.text, area: "Other", outcome: "unknown" };
    }
  } catch {
    return {
      text: "Julian's brain is taking a snow nap. Try again later, or message us on the trip WhatsApp group.",
      area: "Other",
      outcome: "unknown",
    };
  }
}

export function ChatWidget() {
  const [env, setEnv] = useState<ChatEnvironment | null>(null);
  useEffect(() => setEnv(pickEnvironment()), []);
  return env ? <ChatPanel env={env} /> : null;
}

function ChatPanel({ env }: { env: ChatEnvironment }) {
  const identity = env.useIdentity();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [rows, setRows] = useState<KbRow[]>([]);
  const [brain, setBrain] = useState<ChatBrain | null>(null);
  const [topics, setTopics] = useState(false);
  const [area, setArea] = useState<string | null>(null);

  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef({ identity, brain });
  latest.current = { identity, brain };

  // Load what the bot can answer from once the panel is opened, and again if
  // the person signs in or out (that changes which rows they may see).
  const status = identity.status;
  useEffect(() => {
    if (!open || status === "loading") return;
    let cancelled = false;
    env
      .loadKnowledge(latest.current.identity)
      .then((loaded) => {
        if (cancelled) return;
        setRows(loaded);
        setBrain(makeBrain(loaded));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, status, env]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { id: nextId.current++, role: "bot", text: greeting, links: [], signIn: false },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking, topics, area]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = useCallback(
    async (text: string) => {
      const question = text.trim().slice(0, 300);
      if (!question) return;
      setMessages((m) => [
        ...m,
        { id: nextId.current++, role: "user", text: question, links: [], signIn: false },
      ]);
      setDraft("");
      setTopics(false);
      setArea(null);
      setThinking(true);
      const started = Date.now();

      let current = latest.current.brain;
      if (!current) {
        try {
          const loaded = await env.loadKnowledge(latest.current.identity);
          setRows(loaded);
          current = makeBrain(loaded);
          setBrain(current);
        } catch {
          current = makeBrain([]);
        }
      }
      const { identity: who } = latest.current;
      const now = appNow();
      const signedIn = who.status === "signed-in";
      let reply = answer(question, current, {
        now,
        signedIn,
        profile: who.profile,
        profileLoaded: who.profileLoaded,
      });

      // What the free search could not answer goes to Haiku, for signed-in people only.
      let source: LogEntry["source"] = reply.source === "unknown" ? "none" : reply.source;
      let outcome: LogEntry["outcome"] = reply.unanswered
        ? "unknown"
        : reply.source === "login"
          ? "login_prompt"
          : reply.source === "unknown"
            ? "unknown"
            : "answered";
      if (reply.source === "unknown" && signedIn) {
        const ai = await askAi(question, who, now);
        reply = { text: ai.text, source: "unknown", area: ai.area };
        source = "ai";
        outcome = ai.outcome;
      }
      logChat({
        env: env.env,
        area: reply.area ?? "Other",
        source,
        outcome,
        question,
      });

      // A short pause so it feels like Julian is thinking, not a form submit.
      const wait = Math.max(0, 450 - (Date.now() - started));
      window.setTimeout(() => {
        setThinking(false);
        setMessages((m) => [
          ...m,
          {
            id: nextId.current++,
            role: "bot",
            text: reply.text,
            links: reply.links ?? [],
            signIn: reply.signIn === true,
          },
        ]);
      }, wait);
    },
    [env],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  // Topic chips: only rows that have an answer, grouped by area.
  const areas = useMemo(() => {
    const byArea = new Map<string, KbRow[]>();
    for (const r of rows) {
      if (!r.answer.trim() || r.area === "Guide FAQ") continue;
      byArea.set(r.area, [...(byArea.get(r.area) ?? []), r]);
    }
    return byArea;
  }, [rows]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => input.current?.focus(), 50);
          }}
          className="fixed bottom-4 right-4 z-50 flex size-16 items-center justify-center rounded-full border-[1.5px] border-border bg-card shadow-[0_10px_30px_-10px_oklch(0.27_0.06_258/0.55)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ask Julian a question about the trip"
        >
          <Julian className="size-12" />
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Chat with Julian"
          className="fixed bottom-3 left-8 right-3 z-50 flex h-[72dvh] flex-col overflow-hidden rounded-2xl border-[1.5px] border-border bg-card shadow-[0_20px_60px_-20px_oklch(0.27_0.06_258/0.6)] sm:bottom-4 sm:left-auto sm:right-4 sm:h-[34rem] sm:max-h-[calc(100dvh-2rem)] sm:w-[23.5rem] sm:rounded-2xl"
        >
          <header className="flex items-center gap-3 border-b border-border bg-paper px-4 py-2.5">
            <Julian className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg uppercase leading-none">Julian</p>
              <p className="text-xs text-muted-foreground">The snowman who knows the trip</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close chat"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>

          {identity.status === "signed-out" && identity.signIn && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-mint px-4 py-2 text-xs">
              <span>Sign in for your room, your coach and smarter answers.</span>
              <button
                type="button"
                onClick={identity.signIn}
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 font-bold uppercase text-primary-foreground hover:bg-primary/90"
              >
                Sign in
              </button>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} identity={identity} />
            ))}
            {thinking && (
              <p className="text-xs italic text-muted-foreground" role="status">
                Julian is checking his notes…
              </p>
            )}
            <div ref={bottom} />
          </div>

          <div className="border-t border-border bg-paper px-3 pt-2.5">
            {area === null && !topics && (
              <div className="flex flex-wrap gap-1.5 pb-2.5">
                {quick.map((c) => (
                  <Chip key={c.label} onClick={() => void ask(c.ask)}>
                    {c.label}
                  </Chip>
                ))}
                {areas.size > 0 && (
                  <Chip subtle onClick={() => setTopics(true)}>
                    More topics
                  </Chip>
                )}
              </div>
            )}
            {area === null && topics && (
              <div className="flex flex-wrap gap-1.5 pb-2.5">
                <Chip subtle onClick={() => setTopics(false)}>
                  <ArrowLeft aria-hidden="true" className="size-3.5" /> Back
                </Chip>
                {[...areas.keys()].map((a) => (
                  <Chip key={a} onClick={() => setArea(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            )}
            {area !== null && (
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pb-2.5">
                <Chip subtle onClick={() => setArea(null)}>
                  <ArrowLeft aria-hidden="true" className="size-3.5" /> {area}
                </Chip>
                {(areas.get(area) ?? []).map((r) => (
                  <Chip key={r.id} onClick={() => void ask(r.question)}>
                    {r.question}
                  </Chip>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2 pb-3">
              <input
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={300}
                placeholder="Ask Julian…"
                aria-label="Your question"
                enterKeyHint="send"
                className="h-11 min-w-0 flex-1 rounded-full border border-input bg-card px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!draft.trim() || thinking}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                aria-label="Send"
              >
                <Send aria-hidden="true" className="size-4" />
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

function Chip({
  children,
  onClick,
  subtle,
}: {
  children: React.ReactNode;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center gap-1 rounded-full border px-3 py-1.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        subtle
          ? "border-transparent bg-transparent text-muted-foreground hover:bg-secondary"
          : "border-border bg-card hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

function Bubble({ message, identity }: { message: Message; identity: ChatIdentity }) {
  const mine = message.role === "user";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary text-foreground",
        )}
      >
        <p className="whitespace-pre-line">{message.text}</p>
        {message.signIn && identity.signIn && (
          <button
            type="button"
            onClick={identity.signIn}
            className="mt-2 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90"
          >
            Sign in
          </button>
        )}
        {message.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.links.map((l) => {
              const external = /^https?:/.test(l.href);
              return (
                <a
                  key={`${l.label}-${l.href}`}
                  href={l.href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground hover:bg-paper"
                >
                  {l.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
