import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expense Tracker Template",
  description:
    "Daily expense log with date, description, category, and amount columns. Download as a free printable PDF.",
  alternates: { canonical: "/templates/expense-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
