import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money Counting Worksheets",
  description:
    "Learn to count coins and make change with visual coin-counting exercises.",
  alternates: { canonical: "/kids/money-counting" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
