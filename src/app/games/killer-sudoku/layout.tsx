import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Killer Sudoku — Free Printable PDFs with Sum Cages",
  description:
    "Free printable killer sudoku: sudoku grids partitioned into sum cages with no given digits. Every puzzle is verified uniquely solvable and ships with its answer key — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "killer sudoku",
    "killer sudoku printable",
    "sum sudoku",
    "killer sudoku pdf",
    "addoku",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/killer-sudoku" },
  ...toolOpenGraph({
    title: "Killer Sudoku — Free Printable PDFs with Sum Cages",
    description:
      "Sudoku with sum cages instead of givens, verified to have exactly one solution. Printable killer sudoku PDFs with answer keys.",
    path: "/games/killer-sudoku",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
