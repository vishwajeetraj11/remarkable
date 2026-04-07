import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coloring Pages",
  description:
    "Line art coloring pages optimized for e-ink on reMarkable. Download as PDF for your tablet.",
  alternates: { canonical: "/kids/coloring" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
