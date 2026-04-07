import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quarterly Goals Template",
  description:
    "Quarter overview with goal tracking, monthly breakdowns, and KPI sections. Download as a free printable PDF.",
  alternates: { canonical: "/templates/quarterly-goals" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
