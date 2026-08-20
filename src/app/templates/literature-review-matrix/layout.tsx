import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Literature Review Matrix Template",
  description:
    "Compare research sources side by side with a literature review matrix for methods, findings, limitations, themes, and synthesis.",
  alternates: { canonical: "/templates/literature-review-matrix" },
  ...toolOpenGraph({
    title: "Literature Review Matrix Template",
    description:
      "Compare research sources side by side with fields for methods, findings, limitations, themes, and synthesis.",
    path: "/templates/literature-review-matrix",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
