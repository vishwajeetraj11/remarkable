import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SudokuPage from "../page";

const difficulties = {
  easy: {
    title: "Easy Sudoku Puzzles — Free Printable PDF",
    description:
      "Generate easy Sudoku puzzles with 35 clues. Perfect for beginners and kids learning logic. Free printable PDF with answer keys.",
  },
  medium: {
    title: "Medium Sudoku Puzzles — Free Printable PDF",
    description:
      "Generate medium difficulty Sudoku puzzles with 28 clues. A balanced challenge for regular solvers. Free printable PDF with answer keys.",
  },
  hard: {
    title: "Hard Sudoku Puzzles — Free Printable PDF",
    description:
      "Generate hard Sudoku puzzles with 22 clues for experienced players. Test your advanced solving techniques. Free printable PDF with answer keys.",
  },
  evil: {
    title: "Evil Sudoku Puzzles — Free Printable PDF",
    description:
      "Generate evil difficulty Sudoku puzzles with only 17 clues. The ultimate challenge for expert solvers. Free printable PDF.",
  },
} as const;

type Difficulty = keyof typeof difficulties;

export function generateStaticParams() {
  return Object.keys(difficulties).map((d) => ({ difficulty: d }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ difficulty: string }>;
}): Promise<Metadata> {
  const { difficulty } = await params;
  const meta = difficulties[difficulty as Difficulty];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/games/sudoku/${difficulty}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ difficulty: string }>;
}) {
  const { difficulty } = await params;
  if (!(difficulty in difficulties)) notFound();
  return <SudokuPage />;
}
