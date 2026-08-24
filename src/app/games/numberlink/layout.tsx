import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Numberlink — Free Printable Path Puzzles PDF",
  description:
    "Free printable numberlink (Flow) puzzles: connect matching number pairs with non-crossing paths that cover the whole board. Solver-verified unique — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "numberlink",
    "flow puzzle",
    "flow free printable",
    "path puzzle pdf",
    "logic puzzle",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/numberlink" },
  ...toolOpenGraph({
    title: "Numberlink — Free Printable Path Puzzles PDF",
    description:
      "Connect matching pairs without crossings — full-coverage boards, unique solutions. Printable numberlink PDFs.",
    path: "/games/numberlink",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
