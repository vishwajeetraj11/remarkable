import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Planner — Hyperlinked Project Template for reMarkable",
  description:
    "A printable, hyperlinked project planner PDF — tap the contents page to jump to any section and tap back to the index from any page. Includes overview, goals, milestones, tasks, risks, and notes. Free download for reMarkable and other e-ink tablets.",
  keywords: [
    "project planner",
    "hyperlinked PDF",
    "project template",
    "remarkable planner",
    "tappable PDF planner",
    "project management template",
    "milestones tracker",
    "printable project planner",
  ],
  alternates: { canonical: "/templates/project-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
