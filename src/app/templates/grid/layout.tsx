import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grid Paper Template",
  description:
    "Square grid paper for sketching, diagrams, and technical drawings. Download as a free printable PDF.",
  alternates: { canonical: "/templates/grid" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
