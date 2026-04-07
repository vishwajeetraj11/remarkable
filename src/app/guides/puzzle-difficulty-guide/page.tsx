import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Choosing the Right Puzzle Difficulty — Remarkable Skills",
  description:
    "Understand what each difficulty level means for Sudoku, crosswords, mazes, word search, and more. Includes recommended starting levels for kids, casual solvers, and advanced players.",
  alternates: { canonical: "/guides/puzzle-difficulty-guide" },
};

const puzzles = [
  {
    name: "Sudoku",
    href: "/games/sudoku",
    levels: [
      { level: "Easy", detail: "30+ given digits. Solvable with naked singles only." },
      { level: "Medium", detail: "26–29 givens. Requires hidden singles and basic scanning." },
      { level: "Hard", detail: "22–25 givens. Needs pointing pairs, box/line reduction." },
      { level: "Evil", detail: "17–21 givens. Advanced techniques like X-Wing and Swordfish." },
    ],
    kids: "Easy",
    casual: "Easy–Medium",
    advanced: "Hard–Evil",
  },
  {
    name: "Word Search",
    href: "/games/word-search",
    levels: [
      { level: "Easy", detail: "Small grid, 8–10 words, no diagonal or backward placement." },
      { level: "Medium", detail: "Medium grid, 12–15 words, diagonals included." },
      { level: "Hard", detail: "Large grid, 18–20 words, all directions including backward." },
    ],
    kids: "Easy",
    casual: "Medium",
    advanced: "Hard",
  },
  {
    name: "Crossword",
    href: "/games/crossword",
    levels: [
      { level: "Easy", detail: "Common words, straightforward clues, smaller grid." },
      { level: "Medium", detail: "Mixed vocabulary, some wordplay in clues." },
      { level: "Hard", detail: "Larger grid, trickier clues, less common vocabulary." },
    ],
    kids: "Easy",
    casual: "Easy–Medium",
    advanced: "Hard",
  },
  {
    name: "Maze",
    href: "/games/maze",
    levels: [
      { level: "Easy", detail: "Few dead ends, wide corridors, quick solve." },
      { level: "Medium", detail: "More branching paths and moderate dead ends." },
      { level: "Hard", detail: "Dense corridors, many dead ends, longer solving time." },
    ],
    kids: "Easy",
    casual: "Medium",
    advanced: "Hard",
  },
  {
    name: "Nonogram",
    href: "/games/nonogram",
    levels: [
      { level: "5×5", detail: "Introductory — solvable in a few minutes." },
      { level: "10×10", detail: "Standard difficulty. Requires line-solving logic." },
      { level: "15×15", detail: "Complex images. Demands careful cross-referencing." },
    ],
    kids: "5×5",
    casual: "10×10",
    advanced: "15×15",
  },
  {
    name: "Cryptogram",
    href: "/games/cryptogram",
    levels: [
      { level: "Easy", detail: "Short quotes, common letter patterns, hints provided." },
      { level: "Medium", detail: "Longer text, fewer obvious patterns." },
      { level: "Hard", detail: "Full paragraphs, unusual vocabulary, no hints." },
    ],
    kids: "—",
    casual: "Easy–Medium",
    advanced: "Hard",
  },
  {
    name: "Kakuro",
    href: "/games/kakuro",
    levels: [
      { level: "Easy", detail: "Small grid, mostly 2-cell runs with low sums." },
      { level: "Medium", detail: "Larger grid, 3–4 cell runs, requires elimination." },
      { level: "Hard", detail: "Complex grid, long runs, multiple interleaving constraints." },
    ],
    kids: "—",
    casual: "Easy",
    advanced: "Medium–Hard",
  },
  {
    name: "KenKen",
    href: "/games/kenken",
    levels: [
      { level: "3×3", detail: "Addition only. Great for learning the rules." },
      { level: "4×4", detail: "Addition and subtraction. Moderate challenge." },
      { level: "6×6", detail: "All four operations. Requires careful logic." },
    ],
    kids: "3×3",
    casual: "4×4",
    advanced: "6×6",
  },
  {
    name: "Logic Puzzle",
    href: "/games/logic-puzzle",
    levels: [
      { level: "Easy", detail: "3 categories, 3–4 items each, direct clues." },
      { level: "Medium", detail: "4 categories, indirect clues, more elimination." },
      { level: "Hard", detail: "5 categories, complex conditional clues." },
    ],
    kids: "Easy",
    casual: "Easy–Medium",
    advanced: "Hard",
  },
];

export default function PuzzleDifficultyGuide() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <Link
          href="/guides"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Guides
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Choosing the Right Puzzle Difficulty
        </h1>
        <p className="mt-3 text-muted-foreground">
          Not sure where to start? This guide explains what each difficulty level
          means for every puzzle type, with recommendations based on experience
          level.
        </p>
      </header>

      <section className="space-y-10">
        {/* Quick recommendations */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Quick Recommendations
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-semibold">Puzzle</th>
                  <th className="pb-2 font-semibold">Kids</th>
                  <th className="pb-2 font-semibold">Casual</th>
                  <th className="pb-2 font-semibold">Advanced</th>
                </tr>
              </thead>
              <tbody>
                {puzzles.map((p) => (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="py-2.5">
                      <Link
                        href={p.href}
                        className="font-medium underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{p.kids}</td>
                    <td className="py-2.5 text-muted-foreground">{p.casual}</td>
                    <td className="py-2.5 text-muted-foreground">{p.advanced}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-puzzle breakdown */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Detailed Breakdown by Puzzle
          </h2>
        </div>

        {puzzles.map((p) => (
          <div key={p.name}>
            <h3 className="font-semibold">
              <Link
                href={p.href}
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                {p.name}
              </Link>
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {p.levels.map((l) => (
                <li key={l.level}>
                  <span className="font-medium text-foreground">
                    {l.level}:
                  </span>{" "}
                  {l.detail}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* General tips */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            General Tips
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              Start one level below where you think you are — building confidence
              is more important than challenge when learning a new puzzle type.
            </li>
            <li>
              Print the answer key on a separate page so you can check without
              spoiling the solve.
            </li>
            <li>
              For kids, pair puzzles with a reward or activity to keep motivation
              high.
            </li>
            <li>
              Advanced solvers: try timing yourself and tracking improvement
              across sessions.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Start solving
          </h2>
          <p className="text-sm text-muted-foreground">
            Jump into any puzzle and generate a fresh PDF at the difficulty that
            suits you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/games/sudoku"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Try Sudoku
            </Link>
            <Link
              href="/games/crossword"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Try Crossword
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              All Puzzles →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
