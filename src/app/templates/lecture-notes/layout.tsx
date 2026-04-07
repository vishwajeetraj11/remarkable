import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lecture Notes Template",
  description:
    "Structured lecture page with key concepts, questions, and summary sections. Download as a free printable PDF.",
  alternates: { canonical: "/templates/lecture-notes" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
