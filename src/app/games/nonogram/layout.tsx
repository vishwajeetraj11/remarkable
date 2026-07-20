import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Nonogram Puzzles",
  description:
    "Pixel logic puzzles (picross/griddlers) for reMarkable. Download as PDF for your e-ink tablet.",
  alternates: { canonical: "/games/nonogram" },
  ...toolOpenGraph({
    title: "Nonogram Puzzles",
    description:
      "Pixel logic puzzles (picross/griddlers) for reMarkable. Download as PDF for your e-ink tablet.",
    path: "/games/nonogram",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
