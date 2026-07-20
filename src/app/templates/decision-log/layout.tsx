import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Decision Log Template",
  description:
    "Record decisions with context, options considered, rationale, and outcome tracking. Download as a free printable PDF.",
  alternates: { canonical: "/templates/decision-log" },
  ...toolOpenGraph({
    title: "Decision Log Template",
    description:
      "Record decisions with context, options considered, rationale, and outcome tracking. Download as a free printable PDF.",
    path: "/templates/decision-log",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
