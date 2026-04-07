import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dot Grid Template",
  description:
    "Evenly spaced dots for bullet journaling, sketching, and freeform note-taking. Download as a free printable PDF.",
  alternates: { canonical: "/templates/dot-grid" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
