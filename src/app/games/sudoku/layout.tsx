import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sudoku Puzzles",
  description:
    "Generate unique Sudoku puzzles from easy to evil difficulty. Download as PDF for reMarkable tablet.",
  keywords: [
    "sudoku pdf",
    "printable sudoku",
    "sudoku generator",
    "free sudoku puzzles",
    "remarkable sudoku",
    "sudoku for e-ink tablet",
  ],
  alternates: { canonical: "/games/sudoku" },
  ...toolOpenGraph({
    title: "Sudoku Puzzles",
    description:
      "Generate unique Sudoku puzzles from easy to evil difficulty. Download as PDF for reMarkable tablet.",
    path: "/games/sudoku",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
