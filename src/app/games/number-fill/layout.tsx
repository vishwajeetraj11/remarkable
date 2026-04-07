import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Number Fill-In Puzzles",
  description:
    "Fit numbers of various lengths into a crossword-style grid. Download as PDF with answer keys.",
  alternates: { canonical: "/games/number-fill" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
