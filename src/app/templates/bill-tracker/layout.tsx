import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bill Tracker Template",
  description:
    "Track recurring bills with paid checkbox, due date, amount, and payment method. Download as a free printable PDF.",
  alternates: { canonical: "/templates/bill-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
