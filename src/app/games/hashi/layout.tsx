import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hashi (Bridges) — Free Printable PDFs",
  description:
    "Free printable Hashiwokakero puzzles: connect numbered islands with single and double bridges into one connected network. Every puzzle solver-verified unique — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "hashi",
    "hashiwokakero",
    "bridges puzzle",
    "bridge building puzzle printable",
    "logic puzzle pdf",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/hashi" },
  ...toolOpenGraph({
    title: "Hashi (Bridges) — Free Printable PDFs",
    description:
      "Connect the islands with single and double bridges. Printable hashi PDFs with unique-solution guarantee.",
    path: "/games/hashi",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
