import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hangman Sheets — Free Printable PDFs with Answer Keys",
  description:
    "Free printable hangman sheets: themed secret words with drawing boxes and alphabet trackers, two rounds per page. Filter by category and download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "hangman",
    "printable hangman",
    "hangman sheets",
    "word game pdf",
    "classroom hangman",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/hangman" },
  ...toolOpenGraph({
    title: "Hangman Sheets — Free Printable PDFs with Answer Keys",
    description:
      "Printable hangman rounds with themed words, drawing boxes, and alphabet trackers. Category filters and answer keys included.",
    path: "/games/hangman",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
