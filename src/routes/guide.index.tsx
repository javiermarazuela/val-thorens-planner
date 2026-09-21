import { createFileRoute, redirect } from "@tanstack/react-router";

// The guide is now part of the single page; keep old shared links working.
export const Route = createFileRoute("/guide/")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "week" });
  },
  component: () => null,
});
