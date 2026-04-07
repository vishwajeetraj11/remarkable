import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lined Paper Template",
  description:
    "Classic horizontal ruling with adjustable spacing, optional left margin, and header zone. Download as a free printable PDF.",
  alternates: { canonical: "/templates/lined" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
