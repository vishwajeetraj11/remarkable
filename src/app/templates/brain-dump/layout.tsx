import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Brain Dump Template",
  description:
    "Dump everything on your mind then sort into actionable categories. Download as a free printable PDF.",
  alternates: { canonical: "/templates/brain-dump" },
  ...toolOpenGraph({
    title: "Brain Dump Template",
    description:
      "Dump everything on your mind then sort into actionable categories. Download as a free printable PDF.",
    path: "/templates/brain-dump",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
