import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kakuro Puzzles",
  description:
    "Math crossword puzzles — fill cells with digits that sum to the clues. Download as PDF with answer keys.",
  alternates: { canonical: "/games/kakuro" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
