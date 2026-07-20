import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reading Log Template",
  description:
    "Track books read with title, author, start and finish dates, and rating. Download as a free printable PDF.",
  alternates: { canonical: "/templates/reading-log" },
  ...toolOpenGraph({
    title: "Reading Log Template",
    description:
      "Track books read with title, author, start and finish dates, and rating. Download as a free printable PDF.",
    path: "/templates/reading-log",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
