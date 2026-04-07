import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Log Template",
  description:
    "Track sleep with bed time, wake time, quality rating, and nightly notes. Download as a free printable PDF.",
  alternates: { canonical: "/templates/sleep-log" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
