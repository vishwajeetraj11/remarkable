import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Birthday & Event Tracker",
  description:
    "Annual tracker for birthdays, anniversaries, and important dates organized by month.",
  alternates: { canonical: "/templates/birthday-tracker" },
  ...toolOpenGraph({
    title: "Birthday & Event Tracker",
    description:
      "Annual tracker for birthdays, anniversaries, and important dates organized by month.",
    path: "/templates/birthday-tracker",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
