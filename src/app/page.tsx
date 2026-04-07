import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";

const games = [
  { name: "Sudoku", href: "/games/sudoku", desc: "Easy to evil difficulty" },
  {
    name: "Word Search",
    href: "/games/word-search",
    desc: "Themed categories",
  },
  {
    name: "Crossword",
    href: "/games/crossword",
    desc: "Auto-generated clues",
  },
  { name: "Maze", href: "/games/maze", desc: "Multiple sizes & styles" },
  { name: "Nonogram", href: "/games/nonogram", desc: "Pixel logic puzzles" },
  {
    name: "Word Scramble",
    href: "/games/word-scramble",
    desc: "Unscramble the letters",
  },
  {
    name: "Cryptogram",
    href: "/games/cryptogram",
    desc: "Decode encrypted quotes",
  },
  {
    name: "Kakuro",
    href: "/games/kakuro",
    desc: "Math crossword puzzles",
  },
  {
    name: "KenKen",
    href: "/games/kenken",
    desc: "Arithmetic cage logic",
  },
  {
    name: "Word Ladder",
    href: "/games/word-ladder",
    desc: "Transform words step by step",
  },
  {
    name: "Number Fill-In",
    href: "/games/number-fill",
    desc: "Fit numbers into a grid",
  },
  {
    name: "Logic Puzzle",
    href: "/games/logic-puzzle",
    desc: "Clue-based deduction grids",
  },
];

const showcaseTemplates = [
  {
    name: "Weekly Planner",
    href: "/templates/planner",
    desc: "Seven-column weekly layout",
  },
  {
    name: "Monthly Calendar",
    href: "/templates/monthly-calendar",
    desc: "Traditional grid calendar",
  },
  {
    name: "Habit Tracker",
    href: "/templates/habit-tracker",
    desc: "31-day habit grid",
  },
  {
    name: "Cornell Notes",
    href: "/templates/cornell",
    desc: "Study & review system",
  },
];

const moreTemplates = [
  { name: "Daily Focus", href: "/templates/daily-focus" },
  { name: "Meeting Notes", href: "/templates/meeting-notes" },
  { name: "Fitness Planner", href: "/templates/fitness-planner" },
  { name: "Vision Board", href: "/templates/vision-board" },
  { name: "Savings Challenge", href: "/templates/savings-challenge" },
];

const kids = [
  {
    name: "Letter Tracing",
    href: "/kids/tracing",
    desc: "Learn handwriting with guided letterforms",
  },
  {
    name: "Math Worksheets",
    href: "/kids/math",
    desc: "Addition, subtraction, multiplication & division",
  },
  {
    name: "Coloring Pages",
    href: "/kids/coloring",
    desc: "Line art optimized for e-ink",
  },
  {
    name: "Connect the Dots",
    href: "/kids/connect-dots",
    desc: "Numbered dot-to-dot puzzles",
  },
  {
    name: "Sight Words",
    href: "/kids/sight-words",
    desc: "Grade-level reading & writing practice",
  },
  {
    name: "Spelling Practice",
    href: "/kids/spelling",
    desc: "Letter boxes & writing lines",
  },
  {
    name: "Cursive Handwriting",
    href: "/kids/cursive",
    desc: "Guided four-line practice sheets",
  },
  {
    name: "Telling Time",
    href: "/kids/telling-time",
    desc: "Read analog clocks",
  },
  {
    name: "Pattern Recognition",
    href: "/kids/patterns",
    desc: "Complete the sequence",
  },
  {
    name: "Money Counting",
    href: "/kids/money-counting",
    desc: "Count coins & make change",
  },
  {
    name: "Vocabulary",
    href: "/kids/vocabulary",
    desc: "Themed word cards with definitions",
  },
];

/* ---------- SVG template thumbnails ---------- */

function PlannerThumb() {
  return (
    <svg viewBox="0 0 120 168" fill="none" className="w-full h-full">
      {/* Header bar */}
      <rect
        x="8"
        y="14"
        width="104"
        height="8"
        rx="1"
        fill="currentColor"
        fillOpacity="0.06"
      />
      {/* 7 columns */}
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={i}
          x1={8 + ((i + 1) * 104) / 7}
          y1="14"
          x2={8 + ((i + 1) * 104) / 7}
          y2="156"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.12"
        />
      ))}
      {/* Time rows */}
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1="8"
          y1={30 + i * 11.5}
          x2="112"
          y2={30 + i * 11.5}
          stroke="currentColor"
          strokeWidth="0.4"
          strokeOpacity="0.08"
        />
      ))}
      {/* Filled event blocks */}
      <rect
        x="10"
        y="30"
        width="12"
        height="18"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <rect
        x="40"
        y="53"
        width="12"
        height="24"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <rect
        x="70"
        y="41"
        width="12"
        height="14"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.07"
      />
      <rect
        x="25"
        y="76"
        width="12"
        height="20"
        rx="1.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
    </svg>
  );
}

function CalendarThumb() {
  return (
    <svg viewBox="0 0 120 168" fill="none" className="w-full h-full">
      {/* Title line */}
      <line
        x1="8"
        y1="16"
        x2="52"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />
      {/* 5×7 day grid */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const x = 8 + col * 15;
          const y = 28 + row * 24;
          const dayNum = row * 7 + col + 1;
          if (dayNum > 31) return null;
          return (
            <g key={`${row}-${col}`}>
              <rect
                x={x}
                y={y}
                width="13"
                height="20"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="0.4"
                strokeOpacity="0.1"
              />
              <text
                x={x + 6.5}
                y={y + 12}
                fontSize="5.5"
                fill="currentColor"
                fillOpacity="0.2"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {dayNum}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

function HabitThumb() {
  return (
    <svg viewBox="0 0 120 168" fill="none" className="w-full h-full">
      {/* Title line */}
      <line
        x1="8"
        y1="16"
        x2="46"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />
      {/* Row labels */}
      {Array.from({ length: 5 }, (_, row) => (
        <line
          key={`label-${row}`}
          x1="8"
          y1={34 + row * 26}
          x2="28"
          y2={34 + row * 26}
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.1"
        />
      ))}
      {/* Circle grid — 5 rows × 7 cols */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => {
          const cx = 38 + col * 11;
          const cy = 34 + row * 26;
          const filled =
            [0, 4, 9, 11, 15, 18, 22, 26, 28, 31, 34].indexOf(
              row * 7 + col,
            ) !== -1;
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r="3.5"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity={filled ? "0.25" : "0.12"}
              fill={filled ? "currentColor" : "none"}
              fillOpacity={filled ? "0.12" : "0"}
            />
          );
        }),
      )}
    </svg>
  );
}

function CornellThumb() {
  return (
    <svg viewBox="0 0 120 168" fill="none" className="w-full h-full">
      {/* Title line */}
      <line
        x1="8"
        y1="14"
        x2="112"
        y2="14"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.15"
      />
      {/* Vertical split — cue column */}
      <line
        x1="38"
        y1="14"
        x2="38"
        y2="124"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.15"
      />
      {/* Horizontal split — summary area */}
      <line
        x1="8"
        y1="124"
        x2="112"
        y2="124"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.15"
      />
      {/* Cue column text lines */}
      {Array.from({ length: 4 }, (_, i) => (
        <line
          key={`cue-${i}`}
          x1="12"
          y1={32 + i * 24}
          x2="32"
          y2={32 + i * 24}
          stroke="currentColor"
          strokeWidth="0.75"
          strokeOpacity="0.08"
        />
      ))}
      {/* Note lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`note-${i}`}
          x1="44"
          y1={28 + i * 12}
          x2={90 + (i % 3) * 8 - 12}
          y2={28 + i * 12}
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.08"
        />
      ))}
      {/* Summary lines */}
      {Array.from({ length: 3 }, (_, i) => (
        <line
          key={`sum-${i}`}
          x1="12"
          y1={134 + i * 10}
          x2={80 + i * 10}
          y2={134 + i * 10}
          stroke="currentColor"
          strokeWidth="0.5"
          strokeOpacity="0.08"
        />
      ))}
    </svg>
  );
}

const thumbs = [PlannerThumb, CalendarThumb, HabitThumb, CornellThumb];

function TabletSilhouette() {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      className="w-44 text-foreground opacity-[0.09]"
    >
      <rect
        x="4"
        y="4"
        width="192"
        height="272"
        rx="16"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="16"
        y="16"
        width="168"
        height="248"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={16 + ((i + 1) * 168) / 9}
          y1="40"
          x2={16 + ((i + 1) * 168) / 9}
          y2="210"
          stroke="currentColor"
          strokeWidth={i % 3 === 2 ? "1.5" : "0.75"}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`h${i}`}
          x1="16"
          y1={40 + ((i + 1) * 170) / 9}
          x2="184"
          y2={40 + ((i + 1) * 170) / 9}
          stroke="currentColor"
          strokeWidth={i % 3 === 2 ? "1.5" : "0.75"}
        />
      ))}
      <line
        x1="30"
        y1="230"
        x2="110"
        y2="230"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="30"
        y1="242"
        x2="80"
        y2="242"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="30"
        y1="254"
        x2="140"
        y2="254"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-28 md:pb-20 lg:pt-32">
          <div className="grid lg:grid-cols-[1fr_220px] gap-16 items-start">
            <div>
              <h1
                className="hero-stagger text-[clamp(2.25rem,5vw,4.5rem)] font-bold tracking-tight leading-[1.08]"
                style={{ animationDelay: "80ms" }}
              >
                Puzzles, templates &amp;&nbsp;activities for your{" "}
                <span className="italic font-light">e-ink tablet</span>
              </h1>
              <p
                className="hero-stagger mt-5 text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-lg"
                style={{ animationDelay: "160ms" }}
              >
                Generate unique PDFs optimized for e-ink — sudoku, crosswords,
                mazes, planners, and more.
              </p>
              <div
                className="hero-stagger mt-9 flex flex-wrap gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="/games"
                  className="inline-flex items-center justify-center rounded-lg bg-foreground px-7 py-3 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
                >
                  Browse Puzzles
                </Link>
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center rounded-lg px-7 py-3 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
                >
                  View Templates
                </Link>
              </div>
            </div>

            <div
              className="hero-stagger hidden lg:flex items-start justify-end pt-6"
              style={{ animationDelay: "200ms" }}
              aria-hidden="true"
            >
              <TabletSilhouette />
            </div>
          </div>

          <div
            className="hero-stagger mt-14 pt-7 border-t border-border/60 flex flex-wrap gap-x-10 gap-y-3"
            style={{ animationDelay: "320ms" }}
          >
            {(
              [
                ["12", "puzzle types"],
                ["49+", "page templates"],
                ["8", "template packs"],
                ["11", "kids activities"],
              ] as const
            ).map(([num, label]) => (
              <p key={label} className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">
                  {num}
                </span>{" "}
                {label}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Games — asymmetric featured layout */}
      <Reveal className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <Link href="/games" className="group">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:underline underline-offset-4 decoration-1">
                Games &amp; Puzzles
              </h2>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Infinite procedurally generated puzzles with answer keys
            </p>
          </div>
          <Link
            href="/games"
            className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid md:grid-cols-[2fr_3fr] gap-4">
          <Link href="/games/sudoku" className="group">
            <div className="h-full rounded-xl border border-border p-7 flex flex-col justify-between transition-colors hover:border-foreground/20 hover:bg-accent/40 min-h-[200px]">
              <div>
                <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">
                  Most popular
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  Sudoku
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  Easy to evil difficulty. Fresh puzzles every time, complete
                  with answer keys.
                </p>
              </div>
              <span className="mt-6 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Generate puzzle →
              </span>
            </div>
          </Link>

          <div className="flex flex-col gap-2">
            {games.slice(1).map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className="flex items-center justify-between rounded-lg border border-border px-5 py-3.5 transition-colors hover:border-foreground/20 hover:bg-accent/40">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="font-medium text-sm shrink-0">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">
                      {item.desc}
                    </span>
                  </div>
                  <span className="text-muted-foreground/40 text-xs ml-3 shrink-0 group-hover:text-muted-foreground transition-colors">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Templates — showcase with SVG previews */}
      <section className="border-y border-border bg-muted/25">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
          <Reveal>
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <Link href="/templates" className="group">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:underline underline-offset-4 decoration-1">
                    Templates
                  </h2>
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">
                  8 packs &mdash; planners, meetings, focus, study, life admin,
                  wellness, fitness &amp; more
                </p>
              </div>
              <Link
                href="/templates"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All 49+ templates →
              </Link>
            </div>
          </Reveal>

          {/* Showcase grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {showcaseTemplates.map((item, i) => {
              const Thumb = thumbs[i];
              return (
                <Reveal key={item.href} delay={i * 100}>
                  <Link href={item.href} className="group block">
                    <div className="aspect-5/7 rounded-lg border border-border/80 bg-background p-4 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-foreground/15 group-hover:shadow-sm">
                      <Thumb />
                    </div>
                    <p className="mt-2.5 text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground/70">
                      {item.desc}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* Remaining templates as text links */}
          <Reveal delay={450}>
            <div className="mt-8 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
              <span className="text-muted-foreground/50 mr-1">Also:</span>
              {moreTemplates.map((t, i) => (
                <span key={t.href} className="flex items-center">
                  <Link
                    href={t.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.name}
                  </Link>
                  {i < moreTemplates.length - 1 && (
                    <span className="text-border ml-1.5">·</span>
                  )}
                </span>
              ))}
              <span className="text-border">·</span>
              <Link
                href="/templates"
                className="font-medium text-foreground hover:underline underline-offset-2"
              >
                All 49+ →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Kids */}
      <Reveal className="mx-auto w-full max-w-6xl px-4 py-20 md:py-24">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <Link href="/kids" className="group">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:underline underline-offset-4 decoration-1">
                Kids
              </h2>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Educational activities and fun — ages 3 to 12
            </p>
          </div>
          <Link
            href="/kids"
            className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            All activities →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kids.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div className="rounded-lg border border-border px-4 py-3.5 transition-colors hover:border-foreground/20 hover:bg-accent/40">
                <h3 className="font-medium text-sm leading-tight">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground/70 leading-snug">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* How it works — streamlined */}
      <Reveal className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            {[
              {
                n: "01",
                title: "Choose & customize",
                desc: "Pick a puzzle or template. Adjust difficulty, size, and style.",
              },
              {
                n: "02",
                title: "Generate PDF",
                desc: "A fresh, unique PDF every time — optimized for e-ink display.",
              },
              {
                n: "03",
                title: "Transfer & enjoy",
                desc: "Download and send to your tablet via USB, cloud, or app.",
              },
            ].map((step) => (
              <div key={step.n}>
                <span className="text-[11px] font-semibold text-muted-foreground/40 tabular-nums tracking-wider">
                  {step.n}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
