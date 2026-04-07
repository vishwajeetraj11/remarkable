import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Savings Challenge",
  description:
    "52-week savings tracker with weekly checkboxes and running totals.",
  alternates: { canonical: "/templates/savings-challenge" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
