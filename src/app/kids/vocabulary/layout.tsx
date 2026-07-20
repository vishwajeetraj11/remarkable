import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Vocabulary Flashcards",
  description:
    "Themed vocabulary cards with words, definitions, and drawing space for visual learners.",
  alternates: { canonical: "/kids/vocabulary" },
  ...toolOpenGraph({
    title: "Vocabulary Flashcards",
    description:
      "Themed vocabulary cards with words, definitions, and drawing space for visual learners.",
    path: "/kids/vocabulary",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
