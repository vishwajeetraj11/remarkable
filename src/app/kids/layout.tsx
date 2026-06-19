import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Kids Activities — Educational Printables for reMarkable",
  description:
    "Educational activities for ages 3–12 — letter tracing, math worksheets, coloring pages, and connect-the-dots puzzles. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/kids" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Breadcrumbs />
      {children}
      <RelatedLinks />
    </ErrorBoundary>
  );
}
