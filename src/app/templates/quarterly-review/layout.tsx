import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Quarterly Review Template",
  description:
    "Review wins, evidence, lessons, unfinished work, and next-quarter priorities with a free printable quarterly review PDF.",
  alternates: { canonical: "/templates/quarterly-review" },
  ...toolOpenGraph({
    title: "Quarterly Review Template",
    description:
      "A retrospective quarterly review for wins, evidence, lessons, unfinished work, and next-quarter priorities.",
    path: "/templates/quarterly-review",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
