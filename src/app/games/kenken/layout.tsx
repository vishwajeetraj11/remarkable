import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "KenKen Puzzles",
  description:
    "Arithmetic logic puzzles combining Latin squares with cage operations. Download as PDF with answer keys.",
  alternates: { canonical: "/games/kenken" },
  ...toolOpenGraph({
    title: "KenKen Puzzles",
    description:
      "Arithmetic logic puzzles combining Latin squares with cage operations. Download as PDF with answer keys.",
    path: "/games/kenken",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
