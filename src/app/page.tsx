import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Faq } from "@/components/shared/faq";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";
import { TemplateDiscovery } from "@/components/templates/template-discovery";
import { getTemplatesByHref } from "@/lib/templates/catalog";

const faqs = [
  {
    question: "Is Remarkable Skills free?",
    answer:
      "Yes. Every puzzle, template, and kids activity is completely free to generate and download as a PDF — there is no paywall or subscription.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Everything is generated in your browser, so you can create and download PDFs without signing up or logging in.",
  },
  {
    question: "Which devices are supported?",
    answer:
      "Every template can be generated at the native aspect ratio of your device: reMarkable 2 and Paper Pure (1404×1872), reMarkable Paper Pro (1620×2160), Paper Pro Move (954×1696), Supernote A5X (1404×1872), Supernote Manta (1920×2560), BOOX Note Air and Tab Ultra (1404×1872), Kindle Scribe (1860×2480) — plus A4 and US Letter for printing.",
  },
  {
    question: "Are the puzzles unique each time?",
    answer:
      "Yes. Puzzles are procedurally generated, so you get a fresh, unique PDF every time you generate one — complete with answer keys.",
  },
  {
    question: "How do I get a PDF onto my tablet?",
    answer:
      "Download the generated PDF, then transfer it to your tablet via USB, the device's cloud sync, or its companion app.",
  },
];

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
    name: "Futoshiki",
    href: "/games/futoshiki",
    desc: "Inequality logic grids",
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

const HOME_SHOWCASE_TEMPLATES = getTemplatesByHref([
  "/templates/calendar-2026",
  "/templates/planner",
  "/templates/lecture-notes",
  "/templates/vision-board",
]);

const moreTemplates = [
  { name: "Daily Focus", href: "/templates/daily-focus" },
  { name: "Eisenhower Matrix", href: "/templates/eisenhower-matrix" },
  { name: "Kanban Board", href: "/templates/kanban-board" },
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
    name: "Number Bonds",
    href: "/kids/number-bonds",
    desc: "Part-part-whole bonds & skip counting",
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
                Pick one tool, adjust a few options, and download a free PDF.
                No account or payment required.
              </p>
              <div
                className="hero-stagger mt-9 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link
                  href="/games/sudoku"
                  className="inline-flex items-center justify-center rounded-lg bg-foreground px-7 py-3 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
                >
                  Start with Sudoku
                </Link>
                <Link
                  href="/templates/planner"
                  className="inline-flex items-center justify-center rounded-lg px-7 py-3 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
                >
                  Make a Weekly Planner
                </Link>
                <Link
                  href="/kids/math"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Print Kids Worksheets →
                </Link>
              </div>
              <p
                className="hero-stagger mt-3 text-xs text-muted-foreground"
                style={{ animationDelay: "280ms" }}
              >
                Not sure where to begin? Sudoku creates a ready-to-print PDF in
                under a minute.
              </p>
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
                ["13", "puzzle types"],
                ["65+", "page templates"],
                ["9", "template packs"],
                ["12", "kids activities"],
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
                  9 collections &mdash; planners, meetings, focus, study, life admin,
                  wellness, fitness &amp; more
                </p>
              </div>
              <Link
                href="/templates"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                All 65+ templates →
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <TemplateDiscovery
              templates={HOME_SHOWCASE_TEMPLATES}
              sourcePage="/"
              placement="homepage_template_showcase"
            />
          </Reveal>

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
                All 65+ →
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

      {/* FAQ */}
      <div className="border-t border-border">
        <Faq items={faqs} />
        <FaqJsonLd faqs={faqs} />
      </div>

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
