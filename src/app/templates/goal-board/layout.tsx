import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Goal Board Template",
  description:
    "Quarterly goal-setting board with milestones and target dates for each life area. Free printable PDF for reMarkable tablets.",
  alternates: { canonical: "/templates/goal-board" },
  ...toolOpenGraph({
    title: "Goal Board Template",
    description:
      "Quarterly goal-setting board with milestones and target dates for each life area. Free printable PDF for reMarkable tablets.",
    path: "/templates/goal-board",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
