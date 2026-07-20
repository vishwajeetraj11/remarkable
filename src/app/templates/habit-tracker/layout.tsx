import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Habit Tracker Template",
  description:
    "Monthly grid with 31 day columns and habit rows for consistent streak tracking. Download as a free printable PDF.",
  keywords: [
    "habit tracker template",
    "printable habit tracker",
    "monthly habit tracker pdf",
    "streak tracker template",
    "remarkable habit tracker",
    "free habit tracker printable",
  ],
  alternates: { canonical: "/templates/habit-tracker" },
  ...toolOpenGraph({
    title: "Habit Tracker Template",
    description:
      "Monthly grid with 31 day columns and habit rows for consistent streak tracking. Download as a free printable PDF.",
    path: "/templates/habit-tracker",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
