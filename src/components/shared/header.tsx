"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MobileNavToggle } from "@/components/shared/mobile-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";

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
      { label: "Futoshiki", href: "/games/futoshiki" },
      { label: "Word Ladder", href: "/games/word-ladder" },
      { label: "All puzzles →", href: "/games" },
    ],
  },
  {
    label: "Templates",
    href: "/templates",
    children: [
      { label: "Weekly Planner", href: "/templates/planner" },
      { label: "Weekly Dated Planner", href: "/templates/weekly-dated" },
      { label: "Monthly Calendar", href: "/templates/monthly-calendar" },
      { label: "2026 Calendar", href: "/templates/calendar-2026" },
      { label: "Habit Tracker", href: "/templates/habit-tracker" },
      { label: "Fitness Planner", href: "/templates/fitness-planner" },
      { label: "Vision Board", href: "/templates/vision-board" },
      { label: "Cornell Notes", href: "/templates/cornell" },
      { label: "All templates →", href: "/templates" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Customer Visit Log", href: "/solutions/customer-visit-log" },
      { label: "Multi-Client Notebook", href: "/solutions/multi-client-meeting-notebook" },
      { label: "Book-Writing Planner", href: "/solutions/book-writing-planner" },
      { label: "Client Project Manager", href: "/solutions/client-project-task-manager" },
      { label: "Hyperlinked Planner", href: "/solutions/flexible-hyperlinked-planner" },
      { label: "Custom Planner Request", href: "/solutions/custom-planner-request" },
      { label: "Request a Template →", href: "/requests" },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    children: [
      { label: "Letter Tracing", href: "/kids/tracing" },
      { label: "Math Worksheets", href: "/kids/math" },
      { label: "Number Bonds", href: "/kids/number-bonds" },
      { label: "Sight Words", href: "/kids/sight-words" },
      { label: "Telling Time", href: "/kids/telling-time" },
      { label: "Cursive Practice", href: "/kids/cursive" },
      { label: "All activities →", href: "/kids" },
    ],
  },
  {
    label: "Guides",
    href: "/guides",
    children: [
      { label: "Best reMarkable Planner Setup", href: "/guides/best-remarkable-planner-setup" },
      { label: "Free 2026 Calendar", href: "/guides/free-dated-2026-calendar-eink" },
      { label: "Transfer PDFs to Tablet", href: "/guides/transfer-pdfs-to-tablet" },
      { label: "Puzzle Difficulty Guide", href: "/guides/puzzle-difficulty-guide" },
      { label: "ADHD Productivity Templates", href: "/guides/adhd-productivity-templates" },
      { label: "Homeschool Worksheets", href: "/guides/printable-worksheets-for-homeschool" },
      { label: "All Guides →", href: "/guides" },
    ],
  },
];

export function Header() {
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const menuToggleRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (openMenu === null) return;
    const activeMenu = openMenu;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpenMenu(null);
      menuToggleRefs.current[activeMenu]?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-12 items-center gap-2 py-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-7 w-7"
            aria-hidden="true"
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

        <div className="flex items-center gap-1">
          <nav
            ref={desktopNavRef}
            className="hidden items-center gap-1 xl:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item, index) => {
              const isOpen = openMenu === index;
              const menuId = `desktop-navigation-${index}`;

              return (
                <div
                  key={item.href}
                  className="relative flex items-center"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setOpenMenu(index);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") setOpenMenu(null);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setOpenMenu(null);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-l-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                  <button
                    ref={(node) => {
                      menuToggleRefs.current[index] = node;
                    }}
                    type="button"
                    className="inline-flex size-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-label={`${isOpen ? "Close" : "Open"} ${item.label} menu`}
                    aria-controls={menuId}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(isOpen ? null : index)}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={menuId}
                      className="absolute left-0 top-full z-50 w-56 pt-2"
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          setOpenMenu(null);
                          menuToggleRefs.current[index]?.focus();
                        }
                      }}
                    >
                      <div className="rounded-lg border border-border bg-popover p-1 shadow-lg">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:outline-none"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <ThemeToggle className="hidden xl:inline-flex" />

          <MobileNavToggle navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
