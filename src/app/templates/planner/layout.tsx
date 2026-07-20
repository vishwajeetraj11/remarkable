import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Weekly Planner Template",
  description:
    "Seven-column weekly layout with optional hourly time slots for structured planning. Download as a free printable PDF.",
  keywords: [
    "weekly planner template",
    "printable planner pdf",
    "weekly planner pdf",
    "remarkable planner",
    "hourly planner template",
    "free planner printable",
  ],
  alternates: { canonical: "/templates/planner" },
  ...toolOpenGraph({
    title: "Weekly Planner Template",
    description:
      "Seven-column weekly layout with optional hourly time slots for structured planning. Download as a free printable PDF.",
    path: "/templates/planner",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
