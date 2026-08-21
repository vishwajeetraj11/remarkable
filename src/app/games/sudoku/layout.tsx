import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";

const sudokuFaqs = [
  {
    question: "Are the Sudoku puzzles unique?",
    answer:
      "Yes. Every puzzle is generated fresh in your browser when you click download, so no two PDFs are ever the same.",
  },
  {
    question: "Do the PDFs include answer keys?",
    answer:
      "Yes. Answer keys are always included on the final pages. Multi-puzzle books also include a tappable index page linking to every puzzle and to the answer keys.",
  },
  {
    question: "What grid sizes are available?",
    answer:
      "Four sizes: 4×4 for kids and warm-ups, 6×6 for a light challenge, classic 9×9, and 12×12 for experts.",
  },
  {
    question: "How do I use the PDF on my reMarkable tablet?",
    answer:
      "Choose the reMarkable page size before downloading, then import the PDF via the reMarkable desktop or mobile app. The tappable index links work on the device.",
  },
];

export const metadata: Metadata = {
  title: "Sudoku Puzzles",
  description:
    "Generate unique Sudoku puzzles from easy to evil difficulty. Download as PDF for reMarkable tablet.",
  keywords: [
    "sudoku pdf",
    "printable sudoku",
    "sudoku generator",
    "free sudoku puzzles",
    "remarkable sudoku",
    "sudoku for e-ink tablet",
  ],
  alternates: { canonical: "/games/sudoku" },
  ...toolOpenGraph({
    title: "Sudoku Puzzles",
    description:
      "Generate unique Sudoku puzzles from easy to evil difficulty. Download as PDF for reMarkable tablet.",
    path: "/games/sudoku",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FaqJsonLd faqs={sudokuFaqs} />
    </>
  );
}
