import Link from "next/link";
import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Puzzle Packs",
  description:
    "Download themed puzzle bundles combining multiple puzzle types in one PDF. Road trip, classroom, and brain training packs available.",
  alternates: { canonical: "/packs" },
};

const packs = [
  {
    slug: "road-trip",
    name: "Road Trip Activity Pack",
    badge: "4 puzzle types",
    description:
      "Word searches, crosswords, mazes, and word scrambles — all themed around travel and geography. Perfect for long car rides.",
    contents: ["Word Search", "Crossword", "Maze", "Word Scramble"],
  },
  {
    slug: "classroom",
    name: "Classroom Pack",
    badge: "4 activity types",
    description:
      "Math worksheets, spelling lists, sight word practice, and pattern sequences. Ready-to-print educational activities.",
    contents: [
      "Math Worksheets",
      "Spelling Practice",
      "Sight Words",
      "Pattern Sequences",
    ],
  },
  {
    slug: "brain-training",
    name: "Brain Training Pack",
    badge: "5 puzzle types",
    description:
      "Sudoku, Kakuro, KenKen, cryptograms, and logic grid puzzles. A serious workout for your reasoning skills.",
    contents: ["Sudoku", "Kakuro", "KenKen", "Cryptogram", "Logic Puzzle"],
  },
];

export default function PacksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Puzzle Packs</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Themed bundles combining multiple puzzle types into a single PDF.
          Choose a pack, configure the page size and quantity, then download.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {packs.map((pack) => (
          <Link key={pack.slug} href={`/packs/${pack.slug}`}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{pack.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {pack.badge}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {pack.description}
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pack.contents.map((item) => (
                    <span
                      key={item}
                      className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
