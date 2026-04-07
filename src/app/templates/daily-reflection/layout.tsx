import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Reflection Template",
  description:
    "Guided daily journal with wins, learnings, gratitude, and free journaling space. Download as a free printable PDF.",
  alternates: { canonical: "/templates/daily-reflection" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
