import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Number Fill-In Puzzles",
  description:
    "Fit numbers of various lengths into a crossword-style grid. Download as PDF with answer keys.",
  alternates: { canonical: "/games/number-fill" },
  ...toolOpenGraph({
    title: "Number Fill-In Puzzles",
    description:
      "Fit numbers of various lengths into a crossword-style grid. Download as PDF with answer keys.",
    path: "/games/number-fill",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
