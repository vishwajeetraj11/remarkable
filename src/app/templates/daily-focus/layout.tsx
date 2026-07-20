import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Daily Focus Page Template",
  description:
    "Structured daily page with top 3 priorities, task checklist, and schedule block. Download as a free printable PDF.",
  alternates: { canonical: "/templates/daily-focus" },
  ...toolOpenGraph({
    title: "Daily Focus Page Template",
    description:
      "Structured daily page with top 3 priorities, task checklist, and schedule block. Download as a free printable PDF.",
    path: "/templates/daily-focus",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
