import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Ladder Puzzles",
  description:
    "Change one letter at a time to transform the start word into the end word. Download as PDF with answers.",
  alternates: { canonical: "/games/word-ladder" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
