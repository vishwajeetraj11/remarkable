import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kanban Board Template",
  description:
    "Printable kanban board with customizable workflow columns and card slots. Download as a free printable PDF.",
  alternates: { canonical: "/templates/kanban-board" },
  ...toolOpenGraph({
    title: "Kanban Board Template",
    description:
      "Printable kanban board with customizable workflow columns and card slots. Download as a free printable PDF.",
    path: "/templates/kanban-board",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
