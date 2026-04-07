import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nonogram Puzzles",
  description:
    "Pixel logic puzzles (picross/griddlers) for reMarkable. Download as PDF for your e-ink tablet.",
  alternates: { canonical: "/games/nonogram" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
