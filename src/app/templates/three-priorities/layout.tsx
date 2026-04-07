import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3 Priorities Template",
  description:
    "Focus on just three things each day with sub-task checkboxes and notes. Download as a free printable PDF.",
  alternates: { canonical: "/templates/three-priorities" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
