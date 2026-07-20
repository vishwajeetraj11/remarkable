import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Custom Crossword Generator",
  description:
    "Create crossword puzzles with your own words and clues. Download as PDF for reMarkable tablet or print.",
  alternates: { canonical: "/games/crossword/custom" },
  ...toolOpenGraph({
    title: "Custom Crossword Generator",
    description:
      "Create crossword puzzles with your own words and clues. Download as PDF for reMarkable tablet or print.",
    path: "/games/crossword/custom",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
