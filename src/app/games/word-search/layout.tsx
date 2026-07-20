import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Word Search Puzzles",
  description:
    "Themed word search puzzles with customizable grid sizes. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/games/word-search" },
  ...toolOpenGraph({
    title: "Word Search Puzzles",
    description:
      "Themed word search puzzles with customizable grid sizes. Download as PDF for reMarkable tablet.",
    path: "/games/word-search",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
