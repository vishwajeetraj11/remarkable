import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Review Template",
  description:
    "End-of-week review with wins, lessons learned, and next-week focus areas. Download as a free printable PDF.",
  alternates: { canonical: "/templates/weekly-review" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
