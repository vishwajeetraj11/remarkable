import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Weekly Dated Planner — Vertical & Horizontal PDF for reMarkable",
  description:
    "Free printable dated weekly planner with real dates for any week you pick. Choose a vertical (7 day rows) or horizontal (7 columns) layout. Download as a PDF for reMarkable and other e-ink tablets.",
  keywords: [
    "weekly dated planner",
    "dated weekly planner pdf",
    "vertical weekly planner",
    "horizontal weekly planner",
    "printable weekly planner with dates",
    "remarkable weekly planner",
    "weekly planner template pdf",
  ],
  alternates: { canonical: "/templates/weekly-dated" },
  ...toolOpenGraph({
    title: "Weekly Dated Planner — Vertical & Horizontal PDF for reMarkable",
    description:
      "Free printable dated weekly planner with real dates for any week you pick. Choose a vertical (7 day rows) or horizontal (7 columns) layout. Download as a PDF for reMarkable and other e-ink tablets.",
    path: "/templates/weekly-dated",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
