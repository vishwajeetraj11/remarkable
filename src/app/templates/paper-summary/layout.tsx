import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Paper Summary Template",
  description:
    "Academic paper summary with thesis, key findings, methodology, and takeaways. Download as a free printable PDF.",
  alternates: { canonical: "/templates/paper-summary" },
  ...toolOpenGraph({
    title: "Paper Summary Template",
    description:
      "Academic paper summary with thesis, key findings, methodology, and takeaways. Download as a free printable PDF.",
    path: "/templates/paper-summary",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
