"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  {
    label: "Games & Puzzles",
    href: "/games",
    children: [
      { label: "Sudoku", href: "/games/sudoku" },
      { label: "Word Search", href: "/games/word-search" },
      { label: "Crossword", href: "/games/crossword" },
      { label: "Maze", href: "/games/maze" },
      { label: "Nonogram", href: "/games/nonogram" },
      { label: "Word Scramble", href: "/games/word-scramble" },
    ],
  },
  {
    label: "Templates",
    href: "/templates",
    children: [
      { label: "Weekly Planner", href: "/templates/planner" },
      { label: "Dot Grid", href: "/templates/dot-grid" },
      { label: "Lined Paper", href: "/templates/lined" },
      { label: "Cornell Notes", href: "/templates/cornell" },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    children: [
      { label: "Letter Tracing", href: "/kids/tracing" },
      { label: "Math Worksheets", href: "/kids/math" },
      { label: "Coloring Pages", href: "/kids/coloring" },
      { label: "Connect the Dots", href: "/kids/connect-dots" },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
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
            </div>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          {navItems.map((item) => (
            <div key={item.href} className="py-2">
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-1 text-sm font-medium text-foreground"
              >
                {item.label}
              </Link>
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
