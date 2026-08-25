import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Slitherlink — Free Printable Loop Puzzles PDF",
  description:
    "Free printable slitherlink puzzles: draw one closed loop along the dot lattice using the numbered clues. Every puzzle solver-verified unique — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "slitherlink",
    "loop puzzle",
    "slitherlink printable",
    "number logic puzzle",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/slitherlink" },
  ...toolOpenGraph({
    title: "Slitherlink — Free Printable Loop Puzzles PDF",
    description:
      "One closed loop, number clues, guaranteed unique solution. Printable slitherlink PDFs with answer pages.",
    path: "/games/slitherlink",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
