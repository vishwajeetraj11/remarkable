import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Maze Puzzles",
  description:
    "Generate mazes in multiple sizes and styles. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/games/maze" },
  ...toolOpenGraph({
    title: "Maze Puzzles",
    description:
      "Generate mazes in multiple sizes and styles. Download as PDF for reMarkable tablet.",
    path: "/games/maze",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
