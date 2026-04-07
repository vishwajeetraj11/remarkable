import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Scramble Puzzles",
  description:
    "Unscramble the letters word puzzles. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/games/word-scramble" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
