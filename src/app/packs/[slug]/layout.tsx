import type { Metadata } from "next";

const PACK_META: Record<string, { name: string; description: string }> = {
  "road-trip": {
    name: "Road Trip Activity Pack",
    description:
      "Travel-themed word searches, crosswords, mazes, and word scrambles.",
  },
  classroom: {
    name: "Classroom Pack",
    description:
      "Math worksheets, spelling practice, sight words, and pattern sequences.",
  },
  "brain-training": {
    name: "Brain Training Pack",
    description:
      "Sudoku, Kakuro, KenKen, cryptograms, and logic grid puzzles.",
  },
  "logic-masters": {
    name: "Logic Masters Pack",
    description:
      "Number-logic puzzles for deduction lovers: Sudoku, Kakuro, KenKen, Futoshiki, and logic grids.",
  },
  "word-games": {
    name: "Word Games Pack",
    description:
      "A bundle of vocabulary challenges: word searches, crosswords, word scrambles, and cryptograms.",
  },
};

export function generateStaticParams() {
  return [
    { slug: "road-trip" },
    { slug: "classroom" },
    { slug: "brain-training" },
    { slug: "logic-masters" },
    { slug: "word-games" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = PACK_META[slug];
  if (!pack) return { title: "Pack Not Found" };
  return {
    title: pack.name,
    description: pack.description,
    alternates: { canonical: `/packs/${slug}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
