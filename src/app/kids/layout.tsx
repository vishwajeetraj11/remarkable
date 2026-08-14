import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Kids Activities — Educational Printables for reMarkable",
  description:
    "Educational activities for ages 3–12 — letter tracing, math worksheets, coloring pages, and connect-the-dots puzzles. Download as PDF for reMarkable tablet.",
  keywords: [
    "kids printables",
    "letter tracing worksheets",
    "math worksheets pdf",
    "coloring pages pdf",
    "homeschool worksheets",
    "educational printables",
  ],
  alternates: { canonical: "/kids" },
  ...toolOpenGraph({
    title: "Kids Activities — Educational Printables for reMarkable",
    description:
      "Educational activities for ages 3–12 — letter tracing, math worksheets, coloring pages, and connect-the-dots puzzles. Download as PDF for reMarkable tablet.",
    path: "/kids",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Breadcrumbs />
      <p className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground">
        Free printable PDFs · No account required · Includes answer keys where
        applicable.
      </p>
      {children}
      <RelatedLinks />
    </ErrorBoundary>
  );
}
