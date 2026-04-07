import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Math Worksheets",
  description:
    "Addition, subtraction, multiplication, and division worksheets. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/kids/math" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
