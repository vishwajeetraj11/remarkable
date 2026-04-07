import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Calendar Template",
  description:
    "Traditional monthly grid calendar with large day cells for notes and events. Download as a free printable PDF.",
  alternates: { canonical: "/templates/monthly-calendar" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
