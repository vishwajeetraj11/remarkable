import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Number Search Puzzles — Free Printable PDFs",
  description:
    "Free printable number search puzzles: hidden number sequences in a grid of digits, each appearing exactly once. Adjustable grid size and sequence count with answer keys — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "number search",
    "number search puzzle",
    "printable number search",
    "number word search",
    "math puzzle pdf",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/number-search" },
  ...toolOpenGraph({
    title: "Number Search Puzzles — Free Printable PDFs",
    description:
      "Hidden number sequences in a digit grid — each appears exactly once. Printable number search PDFs with answer keys, sized for reMarkable, e-ink, or paper.",
    path: "/games/number-search",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
