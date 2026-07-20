import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sinking Funds Tracker — Printable Savings Planner for reMarkable",
  description:
    "Free printable sinking funds tracker PDF. List funds for car repairs, holidays, gifts, and insurance with goal amounts, monthly contributions, and target dates, then track progress with per-fund thermometers. Built for reMarkable and other e-ink tablets.",
  keywords: [
    "sinking funds tracker",
    "sinking funds printable",
    "savings goals tracker",
    "printable savings planner pdf",
    "monthly savings tracker",
    "remarkable sinking funds",
  ],
  alternates: { canonical: "/templates/sinking-funds" },
  ...toolOpenGraph({
    title: "Sinking Funds Tracker — Printable Savings Planner for reMarkable",
    description:
      "Free printable sinking funds tracker PDF. List funds for car repairs, holidays, gifts, and insurance with goal amounts, monthly contributions, and target dates, then track progress with per-fund thermometers. Built for reMarkable and other e-ink tablets.",
    path: "/templates/sinking-funds",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
