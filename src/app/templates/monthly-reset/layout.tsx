import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Monthly Reset Template",
  description:
    "Reset each month with guided reflection, priorities, commitments, key dates, routines, and first actions in a free PDF pack.",
  alternates: { canonical: "/templates/monthly-reset" },
  ...toolOpenGraph({
    title: "Monthly Reset Template",
    description:
      "A three-page monthly reset for reflection, planning, routines, and first actions.",
    path: "/templates/monthly-reset",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
