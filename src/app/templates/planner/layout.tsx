import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Planner Template",
  description:
    "Seven-column weekly layout with optional hourly time slots for structured planning. Download as a free printable PDF.",
  alternates: { canonical: "/templates/planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
