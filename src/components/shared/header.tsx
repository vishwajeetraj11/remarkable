import Link from "next/link";
import { MobileNavToggle } from "@/components/shared/mobile-nav";

const navItems = [
  {
    label: "Games & Puzzles",
    href: "/games",
    children: [
      { label: "Sudoku", href: "/games/sudoku" },
      { label: "Word Search", href: "/games/word-search" },
      { label: "Crossword", href: "/games/crossword" },
      { label: "Cryptogram", href: "/games/cryptogram" },
      { label: "Kakuro", href: "/games/kakuro" },
      { label: "KenKen", href: "/games/kenken" },
      { label: "Word Ladder", href: "/games/word-ladder" },
      { label: "All 12 Puzzles →", href: "/games" },
    ],
  },
  {
    label: "Templates",
    href: "/templates",
    children: [
      { label: "Weekly Planner", href: "/templates/planner" },
      { label: "Monthly Calendar", href: "/templates/monthly-calendar" },
      { label: "Habit Tracker", href: "/templates/habit-tracker" },
      { label: "Fitness Planner", href: "/templates/fitness-planner" },
      { label: "Vision Board", href: "/templates/vision-board" },
      { label: "Cornell Notes", href: "/templates/cornell" },
      { label: "All 49+ Templates →", href: "/templates" },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    children: [
      { label: "Letter Tracing", href: "/kids/tracing" },
      { label: "Math Worksheets", href: "/kids/math" },
      { label: "Sight Words", href: "/kids/sight-words" },
      { label: "Telling Time", href: "/kids/telling-time" },
      { label: "Cursive Practice", href: "/kids/cursive" },
      { label: "All 11 Activities →", href: "/kids" },
    ],
  },
  {
    label: "Guides",
    href: "/guides",
    children: [
      { label: "Transfer PDFs to Tablet", href: "/guides/transfer-pdfs-to-tablet" },
      { label: "Puzzle Difficulty Guide", href: "/guides/puzzle-difficulty-guide" },
      { label: "ADHD Productivity Templates", href: "/guides/adhd-productivity-templates" },
      { label: "Homeschool Worksheets", href: "/guides/printable-worksheets-for-homeschool" },
      { label: "All Guides →", href: "/guides" },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 min-h-12 py-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7"
          >
            <rect x="3" y="2" width="18" height="20" rx="2" />
            <line x1="7" y1="7" x2="17" y2="7" />
            <line x1="7" y1="11" x2="17" y2="11" />
            <line x1="7" y1="15" x2="13" y2="15" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">
            Remarkable Skills
          </span>
        </Link>

        {/* Desktop nav — pure server-rendered HTML, zero JS */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className="px-3 py-3 min-h-12 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
              {"children" in item && item.children && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <MobileNavToggle navItems={navItems} />
      </div>
    </header>
  );
}
