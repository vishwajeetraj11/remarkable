import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1:1 Notes Template",
  description:
    "Two-column layout for 1:1 meetings with updates, discussion points, and action items. Download as a free printable PDF.",
  alternates: { canonical: "/templates/one-on-one" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
