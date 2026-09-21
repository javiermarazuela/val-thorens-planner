import { createFileRoute, redirect } from "@tanstack/react-router";

const hashForSlug: Record<string, string> = {
  schedule: "week",
  transport: "answers",
  faqs: "answers",
  town: "stay",
  mountain: "mountain",
  "things-to-do": "off-snow",
  "non-skiers": "off-snow",
  "team-games": "off-snow",
  "live-conditions": "mountain",
};

// Old guide pages now live as sections of the single page.
export const Route = createFileRoute("/guide/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/", hash: hashForSlug[params.slug] ?? "top" });
  },
  component: () => null,
});
