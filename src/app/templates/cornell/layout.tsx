import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cornell Notes Template",
  description:
    "Two-column study layout with cue column, main notes area, and summary section. Download as a free printable PDF.",
  alternates: { canonical: "/templates/cornell" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
