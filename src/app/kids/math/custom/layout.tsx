import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Math Worksheet Generator",
  description:
    "Configure exact operations and number ranges for custom math worksheets. Download as PDF for reMarkable tablet or print.",
  alternates: { canonical: "/kids/math/custom" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
