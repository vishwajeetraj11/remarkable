import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sudoku Puzzles",
  description:
    "Generate unique Sudoku puzzles from easy to evil difficulty. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/games/sudoku" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
