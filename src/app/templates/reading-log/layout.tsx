import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Log Template",
  description:
    "Track books read with title, author, start and finish dates, and rating. Download as a free printable PDF.",
  alternates: { canonical: "/templates/reading-log" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
