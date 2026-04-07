import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pattern Recognition Worksheets",
  description:
    "Complete the pattern exercises with shapes, numbers, and letters for early learners.",
  alternates: { canonical: "/kids/patterns" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
