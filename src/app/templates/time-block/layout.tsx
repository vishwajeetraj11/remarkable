import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Time-Block Template",
  description:
    "Full-day time-blocking grid with half-hour slots for focused scheduling. Download as a free printable PDF.",
  alternates: { canonical: "/templates/time-block" },
  ...toolOpenGraph({
    title: "Time-Block Template",
    description:
      "Full-day time-blocking grid with half-hour slots for focused scheduling. Download as a free printable PDF.",
    path: "/templates/time-block",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
