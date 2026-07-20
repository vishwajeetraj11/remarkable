import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Math Worksheets",
  description:
    "Addition, subtraction, multiplication, and division worksheets. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/kids/math" },
  ...toolOpenGraph({
    title: "Math Worksheets",
    description:
      "Addition, subtraction, multiplication, and division worksheets. Download as PDF for reMarkable tablet.",
    path: "/kids/math",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
