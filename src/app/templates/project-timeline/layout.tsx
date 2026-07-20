import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Project Timeline Template",
  description:
    "Visual milestone timeline with date and description fields for project planning. Download as a free printable PDF.",
  alternates: { canonical: "/templates/project-timeline" },
  ...toolOpenGraph({
    title: "Project Timeline Template",
    description:
      "Visual milestone timeline with date and description fields for project planning. Download as a free printable PDF.",
    path: "/templates/project-timeline",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
