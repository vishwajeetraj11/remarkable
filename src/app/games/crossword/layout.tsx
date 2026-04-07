import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crossword Puzzles",
  description:
    "Auto-generated crossword puzzles with clues. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/games/crossword" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
