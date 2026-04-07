import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BundleGenerator from "@/components/games/bundle-generator";

const categories = [
  {
    name: "Logic & Numbers",
    puzzles: [
      { name: "Sudoku", href: "/games/sudoku", desc: "Classic 9x9 number puzzle with multiple difficulty levels", ready: true },
      { name: "Nonogram", href: "/games/nonogram", desc: "Reveal hidden pictures by filling cells using number clues", ready: true },
      { name: "Kakuro", href: "/games/kakuro", desc: "Math crossword — fill cells with digits that sum to the clues", ready: true },
      { name: "KenKen", href: "/games/kenken", desc: "Arithmetic logic puzzles with cage operations on a Latin square", ready: true },
      { name: "Number Fill-In", href: "/games/number-fill", desc: "Fit numbers of various lengths into a crossword-style grid", ready: true },
    ],
  },
  {
    name: "Words",
    puzzles: [
      { name: "Word Search", href: "/games/word-search", desc: "Find hidden words in a grid of letters", ready: true },
      { name: "Crossword", href: "/games/crossword", desc: "Fill in the grid from themed clues", ready: true },
      { name: "Word Scramble", href: "/games/word-scramble", desc: "Unscramble jumbled letters to find the word", ready: true },
      { name: "Cryptogram", href: "/games/cryptogram", desc: "Decode encrypted quotes by cracking the letter substitution cipher", ready: true },
      { name: "Word Ladder", href: "/games/word-ladder", desc: "Change one letter at a time to transform one word into another", ready: true },
    ],
  },
  {
    name: "Spatial & Visual",
    puzzles: [
      { name: "Maze", href: "/games/maze", desc: "Navigate from start to finish through winding paths", ready: true },
    ],
  },
  {
    name: "Logic & Deduction",
    puzzles: [
      { name: "Logic Grid Puzzle", href: "/games/logic-puzzle", desc: "Use clues to deduce which items belong together", ready: true },
    ],
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Games & Puzzles</h1>
        <p className="mt-2 text-muted-foreground">
          Every puzzle is procedurally generated — you get a fresh, unique PDF
          every time. Answer keys included.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.puzzles.map((puzzle) => (
                <Link key={puzzle.href} href={puzzle.href}>
                  <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {puzzle.name}
                        </CardTitle>
                        {puzzle.ready && (
                          <Badge variant="secondary" className="text-xs">
                            Ready
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{puzzle.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BundleGenerator />
    </div>
  );
}
