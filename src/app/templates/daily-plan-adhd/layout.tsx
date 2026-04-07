import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ADHD Daily Plan Template",
  description:
    "Low-friction daily page with energy check, one big thing, and a short task list. Download as a free printable PDF.",
  alternates: { canonical: "/templates/daily-plan-adhd" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
