import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { RelatedLinks } from "@/components/shared/related-links";

export const metadata: Metadata = {
  title: "Games & Puzzles — Free Printable Puzzles for reMarkable",
  description:
    "Thirteen types of procedurally generated puzzles — sudoku, crossword, maze, word search, nonogram, kakuro, kenken, futoshiki, and more — ready to download as PDF for your reMarkable tablet.",
  keywords: [
    "printable puzzles",
    "sudoku pdf",
    "crossword pdf",
    "maze pdf",
    "word search pdf",
    "remarkable puzzles",
  ],
  alternates: { canonical: "/games" },
  ...toolOpenGraph({
    title: "Games & Puzzles — Free Printable Puzzles for reMarkable",
    description:
      "Thirteen types of procedurally generated puzzles — sudoku, crossword, maze, word search, nonogram, kakuro, kenken, futoshiki, and more — ready to download as PDF for your reMarkable tablet.",
    path: "/games",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Breadcrumbs />
      <p className="mx-auto max-w-6xl px-4 pt-4 text-sm text-muted-foreground">
        Free PDF downloads · No signup · Made for reMarkable, Supernote,
        BOOX, and standard printers.
      </p>
      {children}
      <RelatedLinks />
    </ErrorBoundary>
  );
}
