import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Self-Care Checklist Template",
  description:
    "Daily self-care tracking with morning, afternoon, and evening routines plus mood, energy, and hydration logs. Free printable PDF.",
  alternates: { canonical: "/templates/self-care-checklist" },
  ...toolOpenGraph({
    title: "Self-Care Checklist Template",
    description:
      "Daily self-care tracking with morning, afternoon, and evening routines plus mood, energy, and hydration logs. Free printable PDF.",
    path: "/templates/self-care-checklist",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
