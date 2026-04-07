import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipe Page Template",
  description:
    "Recipe card with ingredients checklist, numbered instructions, and notes section. Download as a free printable PDF.",
  alternates: { canonical: "/templates/recipe-page" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
