import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Brief Template",
  description:
    "One-page project overview with objective, scope, timeline, and stakeholders. Download as a free printable PDF.",
  alternates: { canonical: "/templates/project-brief" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
