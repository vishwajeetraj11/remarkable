import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Focus Page Template",
  description:
    "Structured daily page with top 3 priorities, task checklist, and schedule block. Download as a free printable PDF.",
  alternates: { canonical: "/templates/daily-focus" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
