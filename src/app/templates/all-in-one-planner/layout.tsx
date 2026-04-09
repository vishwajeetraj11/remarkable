import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All-in-One Planner Builder",
  description:
    "Generate a fully hyperlinked PDF planner with index, year overview, quarterly goals, monthly calendars, weekly pages, habit tracker, and notes — all navigable by tap.",
  alternates: { canonical: "/templates/all-in-one-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
