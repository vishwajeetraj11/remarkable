import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cursive Handwriting Practice",
  description:
    "Guided cursive writing sheets with four-line guidelines for letters, words, and sentences.",
  alternates: { canonical: "/kids/cursive" },
  ...toolOpenGraph({
    title: "Cursive Handwriting Practice",
    description:
      "Guided cursive writing sheets with four-line guidelines for letters, words, and sentences.",
    path: "/kids/cursive",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
