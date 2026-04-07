import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logic Grid Puzzles",
  description:
    "Use clues to deduce which items belong together in these classic logic puzzles. Download as PDF with solutions.",
  alternates: { canonical: "/games/logic-puzzle" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
