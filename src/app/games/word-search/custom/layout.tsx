import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Word Search Generator",
  description:
    "Create word search puzzles with your own words. Download as PDF for reMarkable tablet or print.",
  alternates: { canonical: "/games/word-search/custom" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
