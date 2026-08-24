import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Arrow Words — Free Printable Mots Fléchés PDFs",
  description:
    "Free printable arrow words (mots fléchés): crossword-style grids where clues are printed inside the grid with direction arrows. Interlocking answers, answer page included — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "arrow words",
    "mots fleches",
    "french crossword",
    "arrow word puzzle printable",
    "crossword pdf",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/arrow-words" },
  ...toolOpenGraph({
    title: "Arrow Words — Free Printable Mots Fléchés PDFs",
    description:
      "Crossword-style grids with in-grid clue arrows. Printable arrow words PDFs with answer pages.",
    path: "/games/arrow-words",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
