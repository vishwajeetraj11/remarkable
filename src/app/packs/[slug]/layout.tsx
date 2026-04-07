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
};

export function generateStaticParams() {
  return [
    { slug: "road-trip" },
    { slug: "classroom" },
    { slug: "brain-training" },
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
