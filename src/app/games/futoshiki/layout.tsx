import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Futoshiki — Free Printable Logic Puzzle PDF for reMarkable",
  description:
    "Generate printable Futoshiki puzzles — Latin-square grids with greater-than / less-than inequality clues. Each puzzle has a unique solution. Download as PDF with answer keys.",
  keywords: [
    "futoshiki",
    "printable futoshiki",
    "futoshiki pdf",
    "inequality puzzle",
    "latin square puzzle",
    "logic puzzle",
    "reMarkable puzzles",
    "e-ink puzzles",
  ],
  alternates: { canonical: "/games/futoshiki" },
  ...toolOpenGraph({
    title: "Futoshiki — Free Printable Logic Puzzle PDF for reMarkable",
    description:
      "Generate printable Futoshiki puzzles — Latin-square grids with greater-than / less-than inequality clues. Each puzzle has a unique solution. Download as PDF with answer keys.",
    path: "/games/futoshiki",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
