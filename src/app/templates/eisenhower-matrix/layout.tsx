import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eisenhower Matrix Template",
  description:
    "Urgent-important priority matrix with four quadrants for do, schedule, delegate, and delete tasks. Download as a free printable PDF.",
  alternates: { canonical: "/templates/eisenhower-matrix" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
