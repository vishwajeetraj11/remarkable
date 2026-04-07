import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursive Handwriting Practice",
  description:
    "Guided cursive writing sheets with four-line guidelines for letters, words, and sentences.",
  alternates: { canonical: "/kids/cursive" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
