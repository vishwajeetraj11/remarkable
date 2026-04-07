import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weight Loss Tracker Template",
  description:
    "12-week weight tracking with weekly logs, progress chart grid, and goal tracking. Download as a free printable PDF.",
  alternates: { canonical: "/templates/weight-loss-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
