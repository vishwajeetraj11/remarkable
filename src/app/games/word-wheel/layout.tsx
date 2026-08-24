import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Word Wheel Puzzle Generator — Free Printable PDFs",
  description:
    "Free printable word wheel puzzles: nine letters around a hub, every word must use the center letter. Fresh nine-letter wheels with complete answer keys — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "word wheel",
    "word wheel puzzle",
    "anagram puzzle printable",
    "nine letter wheel",
    "vocabulary game pdf",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/word-wheel" },
  ...toolOpenGraph({
    title: "Word Wheel Puzzle Generator — Free Printable PDFs",
    description:
      "Nine letters around a hub — build every word that hides inside. Printable word wheel PDFs with writing lines and full answer keys.",
    path: "/games/word-wheel",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
