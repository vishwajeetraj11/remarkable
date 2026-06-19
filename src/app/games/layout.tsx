import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Games & Puzzles — Free Printable Puzzles for reMarkable",
  description:
    "Six types of procedurally generated puzzles — sudoku, crossword, maze, word search, word scramble, and nonogram — ready to download as PDF for your reMarkable tablet.",
  alternates: { canonical: "/games" },
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
