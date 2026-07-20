import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Vision Board Template",
  description:
    "Structured goal-setting template with sections for different life areas.",
  alternates: { canonical: "/templates/vision-board" },
  ...toolOpenGraph({
    title: "Vision Board Template",
    description:
      "Structured goal-setting template with sections for different life areas.",
    path: "/templates/vision-board",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
