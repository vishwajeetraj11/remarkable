import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debt Payoff Tracker — Snowball & Avalanche PDF for reMarkable",
  description:
    "Free printable debt payoff tracker PDF. List creditors, balances, APR, and minimum payments, choose the snowball or avalanche method, and track progress with a payoff thermometer. Built for reMarkable and other e-ink tablets.",
  keywords: [
    "debt payoff tracker",
    "debt snowball tracker",
    "debt avalanche tracker",
    "printable debt tracker pdf",
    "debt payoff planner",
    "remarkable debt tracker",
  ],
  alternates: { canonical: "/templates/debt-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
