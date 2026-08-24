import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Binairo Puzzles — Free Printable Binary Logic Grids",
  description:
    "Free printable binairo (Takuzu) puzzles: fill binary grids using balance, no-triples, and unique-line rules. Sizes 6×6 to 12×12, every puzzle uniquely solvable — download as PDF for reMarkable, e-ink, or paper.",
  keywords: [
    "binairo",
    "takuzu",
    "binary puzzle",
    "binario puzzle",
    "logic grid printable",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games/binairo" },
  ...toolOpenGraph({
    title: "Binairo Puzzles — Free Printable Binary Logic Grids",
    description:
      "Binary logic grids with balance, no-triples, and unique-line rules. Printable binairo PDFs in four sizes with answer keys.",
    path: "/games/binairo",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
