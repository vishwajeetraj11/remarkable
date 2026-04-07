import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cryptogram Puzzles",
  description: "Decode encrypted quotes by cracking the letter substitution cipher. Download as PDF with answer keys.",
  alternates: { canonical: "/games/cryptogram" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
