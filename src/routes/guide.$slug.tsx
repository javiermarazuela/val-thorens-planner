import { createFileRoute, redirect } from "@tanstack/react-router";

const hashForSlug: Record<string, string> = {
  schedule: "week",
  transport: "guide",
  faqs: "contact",
  town: "stay",
  mountain: "guide",
  "things-to-do": "guide",
  "non-skiers": "guide",
  "team-games": "guide",
  "live-conditions": "guide",
};

// Old guide pages now live as sections of the single page.
export const Route = createFileRoute("/guide/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/", hash: hashForSlug[params.slug] ?? "top" });
  },
  component: () => null,
});
