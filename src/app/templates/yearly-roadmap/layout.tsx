import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yearly Roadmap Template",
  description:
    "Full-year overview with quarterly goal boxes and monthly detail pages. Download as a free printable PDF.",
  alternates: { canonical: "/templates/yearly-roadmap" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
