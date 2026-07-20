import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cleaning Schedule Template",
  description:
    "Weekly cleaning checklist organized by room with daily checkboxes.",
  alternates: { canonical: "/templates/cleaning-schedule" },
  ...toolOpenGraph({
    title: "Cleaning Schedule Template",
    description:
      "Weekly cleaning checklist organized by room with daily checkboxes.",
    path: "/templates/cleaning-schedule",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
