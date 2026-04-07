import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitness Planner Template",
  description:
    "Weekly workout planner with exercise rows, sets, reps, and weight tracking. Download as a free printable PDF.",
  alternates: { canonical: "/templates/fitness-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
