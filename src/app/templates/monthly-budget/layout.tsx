import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Budget Template",
  description:
    "Budget table with income, expense categories, and budget-vs-actual columns. Download as a free printable PDF.",
  alternates: { canonical: "/templates/monthly-budget" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
