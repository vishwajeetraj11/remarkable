import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Coloring Pages",
  description:
    "Line art coloring pages optimized for e-ink on reMarkable. Download as PDF for your tablet.",
  alternates: { canonical: "/kids/coloring" },
  ...toolOpenGraph({
    title: "Coloring Pages",
    description:
      "Line art coloring pages optimized for e-ink on reMarkable. Download as PDF for your tablet.",
    path: "/kids/coloring",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
