import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Logic Grid Puzzles",
  description:
    "Use clues to deduce which items belong together in these classic logic puzzles. Download as PDF with solutions.",
  alternates: { canonical: "/games/logic-puzzle" },
  ...toolOpenGraph({
    title: "Logic Grid Puzzles",
    description:
      "Use clues to deduce which items belong together in these classic logic puzzles. Download as PDF with solutions.",
    path: "/games/logic-puzzle",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
