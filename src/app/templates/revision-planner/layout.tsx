import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revision Planner Template",
  description:
    "Subject overview with confidence tracking, topic checklist, and revision schedule. Download as a free printable PDF.",
  alternates: { canonical: "/templates/revision-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
