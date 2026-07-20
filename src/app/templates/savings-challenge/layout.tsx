import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Savings Challenge",
  description:
    "52-week savings tracker with weekly checkboxes and running totals.",
  alternates: { canonical: "/templates/savings-challenge" },
  ...toolOpenGraph({
    title: "Savings Challenge",
    description:
      "52-week savings tracker with weekly checkboxes and running totals.",
    path: "/templates/savings-challenge",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
