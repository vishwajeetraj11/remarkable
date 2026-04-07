import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KenKen Puzzles",
  description:
    "Arithmetic logic puzzles combining Latin squares with cage operations. Download as PDF with answer keys.",
  alternates: { canonical: "/games/kenken" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
