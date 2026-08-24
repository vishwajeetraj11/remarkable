import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bingo Card Generator — Free Printable PDFs with Call Sheet",
  description:
    "Free printable bingo cards: classic 75-ball 5×5 cards with true B-I-N-G-O column ranges and a free center, or compact 3×3 / 4×4 modes. Every download includes a call sheet — ready for reMarkable, e-ink, or paper.",
  keywords: [
    "printable bingo cards",
    "bingo card generator",
    "75 ball bingo",
    "free bingo pdf",
    "classroom bingo",
    "remarkable bingo",
  ],
  alternates: { canonical: "/games/bingo" },
  ...toolOpenGraph({
    title: "Bingo Card Generator — Free Printable PDFs with Call Sheet",
    description:
      "Printable bingo cards with true 75-ball column ranges, free center, and call sheet. Classic 5×5 plus compact 3×3/4×4 modes — free PDF downloads.",
    path: "/games/bingo",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
