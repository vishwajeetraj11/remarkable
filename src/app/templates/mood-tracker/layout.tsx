import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mood Tracker Template",
  description:
    "Monthly mood grid with five levels, daily notes, and a patterns section. Download as a free printable PDF.",
  alternates: { canonical: "/templates/mood-tracker" },
  ...toolOpenGraph({
    title: "Mood Tracker Template",
    description:
      "Monthly mood grid with five levels, daily notes, and a patterns section. Download as a free printable PDF.",
    path: "/templates/mood-tracker",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
