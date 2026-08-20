import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Templates — 65+ Free Printable Templates for reMarkable",
  description:
    "Nine collections of customizable, PDF-ready templates for the reMarkable tablet — planning & calendars, notes & meetings, project management, productivity, study & reading, finance, wellness, and more.",
  keywords: [
    "remarkable templates",
    "printable planner pdf",
    "weekly planner template",
    "calendar template pdf",
    "habit tracker template",
    "productivity templates",
  ],
  alternates: { canonical: "/templates" },
  ...toolOpenGraph({
    title: "Templates — 65+ Free Printable Templates for reMarkable",
    description:
    "Nine collections of customizable, PDF-ready templates for the reMarkable tablet — planning & calendars, notes & meetings, project management, productivity, study & reading, finance, wellness, and more.",
    path: "/templates",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Breadcrumbs />
      <p className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground">
        Free PDF downloads · No account required · Sized for reMarkable,
        Supernote, BOOX, Kindle Scribe, A4, and US Letter.
      </p>
      {children}
      <RelatedLinks />
    </ErrorBoundary>
  );
}
