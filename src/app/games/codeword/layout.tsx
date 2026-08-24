import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Codeword Puzzles — Crack the Code, Printable PDFs",
  description:
    "Free printable codeword (codebreaker) puzzles: every letter hides behind a number. Themed crossword-style grids with starter letters and full answer keys — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "codeword puzzle",
    "codebreaker puzzle",
    "printable codeword",
    "codeword pdf",
    "number letter puzzle",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/codeword" },
  ...toolOpenGraph({
    title: "Codeword Puzzles — Crack the Code, Printable PDFs",
    description:
      "Free printable codeword puzzles: every letter hides behind a number. Themed grids with starter letters and answer keys — ready for reMarkable, e-ink, or paper.",
    path: "/games/codeword",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
