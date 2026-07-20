import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Grocery List Template",
  description:
    "Organized grocery list with categorized sections like produce, dairy, and pantry. Download as a free printable PDF.",
  alternates: { canonical: "/templates/grocery-list" },
  ...toolOpenGraph({
    title: "Grocery List Template",
    description:
      "Organized grocery list with categorized sections like produce, dairy, and pantry. Download as a free printable PDF.",
    path: "/templates/grocery-list",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
