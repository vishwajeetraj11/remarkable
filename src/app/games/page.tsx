import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BundleGenerator from "@/components/games/bundle-generator";
import { Faq } from "@/components/shared/faq";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";

const faqs = [
  {
    question: "Are the games free to download?",
    answer:
      "Yes. Every puzzle is free to generate and download as a PDF — no account or payment required.",
  },
  {
    question: "Can I choose the difficulty?",
    answer:
      "Most puzzles offer difficulty options — Sudoku, for example, ranges from easy to evil. You can adjust difficulty, size, and style before generating.",
  },
  {
    question: "Do the puzzles include answer keys?",
    answer:
      "Yes. Every generated puzzle PDF includes an answer key so you can check your work.",
  },
  {
    question: "Are the puzzles printable?",
    answer:
      "Yes. Each puzzle is a PDF you can read on an e-ink tablet or print on A4 or US Letter paper.",
  },
  {
    question: "Do the puzzles repeat?",
    answer:
      "No. Every puzzle is procedurally generated, so you get a fresh, unique PDF each time you generate one.",
  },
];

const categories = [
  {
    name: "Logic & Numbers",
    puzzles: [
      { name: "Sudoku", href: "/games/sudoku", desc: "Classic 9x9 number puzzle with multiple difficulty levels", ready: true },
      { name: "Nonogram", href: "/games/nonogram", desc: "Reveal hidden pictures by filling cells using number clues", ready: true },
      { name: "Kakuro", href: "/games/kakuro", desc: "Math crossword — fill cells with digits that sum to the clues", ready: true },
      { name: "KenKen", href: "/games/kenken", desc: "Arithmetic logic puzzles with cage operations on a Latin square", ready: true },
      { name: "Futoshiki", href: "/games/futoshiki", desc: "Latin-square grids solved with greater-than / less-than inequality clues", ready: true },
      { name: "Number Fill-In", href: "/games/number-fill", desc: "Fit numbers of various lengths into a crossword-style grid", ready: true },
      { name: "Number Search", href: "/games/number-search", desc: "Find hidden number sequences in a grid of digits", ready: true },
      { name: "Bingo Cards", href: "/games/bingo", desc: "Printable 5×5 bingo cards with call sheet for parties and classrooms", ready: true },
      { name: "Codeword", href: "/games/codeword", desc: "Crack the letter-number code to fill the crossword grid", ready: true },
      { name: "Killer Sudoku", href: "/games/killer-sudoku", desc: "Sudoku with sum cages instead of given digits", ready: true },
      { name: "Binairo", href: "/games/binairo", desc: "Balance 0s and 1s in Takuzu binary logic grids", ready: true },
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
      { name: "Word Wheel", href: "/games/word-wheel", desc: "Make as many words as you can from nine letters around a hub", ready: true },
      { name: "Arrow Words", href: "/games/arrow-words", desc: "Mots fléchés — clues printed inside the grid with direction arrows", ready: true },
      { name: "Hangman Sheets", href: "/games/hangman", desc: "Printable hangman rounds with themed secret words", ready: true },
    ],
  },
  {
    name: "Spatial & Visual",
    puzzles: [
      { name: "Maze", href: "/games/maze", desc: "Navigate from start to finish through winding paths", ready: true },
      { name: "Slitherlink", href: "/games/slitherlink", desc: "Draw one closed loop around numbered dots", ready: true },
      { name: "Hashi (Bridges)", href: "/games/hashi", desc: "Connect numbered islands with single and double bridges", ready: true },
      { name: "Numberlink", href: "/games/numberlink", desc: "Pair matching numbers with paths that never cross", ready: true },
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
    <>
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
                {category.puzzles.map((puzzle) =>
                  puzzle.ready ? (
                    <Link key={puzzle.href} href={puzzle.href}>
                      <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              {puzzle.name}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              Ready
                            </Badge>
                          </div>
                          <CardDescription>{puzzle.desc}</CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ) : (
                    <Card key={puzzle.href} className="h-full opacity-60">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {puzzle.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            Soon
                          </Badge>
                        </div>
                        <CardDescription>{puzzle.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <BundleGenerator />
      </div>

      <div className="border-t border-border">
        <Faq items={faqs} />
        <FaqJsonLd faqs={faqs} />
      </div>
    </>
  );
}
