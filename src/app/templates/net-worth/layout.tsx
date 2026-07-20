import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Net Worth Tracker — Printable Assets & Liabilities PDF for reMarkable",
  description:
    "Free printable net worth tracker PDF. List assets and liabilities side by side, total each column, and compute your net worth with a simple Assets − Liabilities equation, then plot the running total across twelve months. Built for reMarkable and other e-ink tablets.",
  keywords: [
    "net worth tracker",
    "net worth printable",
    "assets and liabilities worksheet",
    "balance sheet printable pdf",
    "personal net worth calculator",
    "remarkable net worth tracker",
  ],
  alternates: { canonical: "/templates/net-worth" },
  ...toolOpenGraph({
    title: "Net Worth Tracker — Printable Assets & Liabilities PDF for reMarkable",
    description:
      "Free printable net worth tracker PDF. List assets and liabilities side by side, total each column, and compute your net worth with a simple Assets − Liabilities equation, then plot the running total across twelve months. Built for reMarkable and other e-ink tablets.",
    path: "/templates/net-worth",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
