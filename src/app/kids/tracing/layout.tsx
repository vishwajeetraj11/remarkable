import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Letter Tracing Worksheets",
  description:
    "Learn handwriting with letter tracing practice sheets. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/kids/tracing" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
