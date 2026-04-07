import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export const metadata: Metadata = {
  title: "Templates — 49+ Free Printable Templates for reMarkable",
  description:
    "Six packs of customizable, PDF-ready templates for the reMarkable tablet — planning & calendars, notes & meetings, project management, productivity, study & reading, finance, wellness, and more.",
  alternates: { canonical: "/templates" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
