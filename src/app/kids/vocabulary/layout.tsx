import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vocabulary Flashcards",
  description:
    "Themed vocabulary cards with words, definitions, and drawing space for visual learners.",
  alternates: { canonical: "/kids/vocabulary" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
