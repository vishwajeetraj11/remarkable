import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Templates — 51+ Free Printable Templates for reMarkable",
  description:
    "Six packs of customizable, PDF-ready templates for the reMarkable tablet — planning & calendars, notes & meetings, project management, productivity, study & reading, finance, wellness, and more.",
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
    title: "Templates — 51+ Free Printable Templates for reMarkable",
    description:
      "Six packs of customizable, PDF-ready templates for the reMarkable tablet — planning & calendars, notes & meetings, project management, productivity, study & reading, finance, wellness, and more.",
    path: "/templates",
  }),
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
