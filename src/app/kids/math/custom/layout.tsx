import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Custom Math Worksheet Generator",
  description:
    "Configure exact operations and number ranges for custom math worksheets. Download as PDF for reMarkable tablet or print.",
  alternates: { canonical: "/kids/math/custom" },
  ...toolOpenGraph({
    title: "Custom Math Worksheet Generator",
    description:
      "Configure exact operations and number ranges for custom math worksheets. Download as PDF for reMarkable tablet or print.",
    path: "/kids/math/custom",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
