import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Notes Template",
  description:
    "Book overview with key takeaways, favourite quotes, and chapter-by-chapter notes. Download as a free printable PDF.",
  alternates: { canonical: "/templates/book-notes" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
