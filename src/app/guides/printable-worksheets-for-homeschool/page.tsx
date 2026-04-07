import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Printable Worksheets for Homeschooling — Remarkable Skills",
  description:
    "Free printable and e-ink worksheets for homeschool: math, sight words, spelling, cursive, telling time, money counting, and pattern recognition — organized by age and subject.",
  alternates: { canonical: "/guides/printable-worksheets-for-homeschool" },
};

const subjects = [
  {
    name: "Math Worksheets",
    href: "/kids/math",
    ages: "Ages 5–12",
    description:
      "Practice addition, subtraction, multiplication, and division with auto-generated problem sets. Each PDF includes an answer key.",
    tips: [
      "Start with single-digit addition for ages 5–6.",
      "Introduce subtraction once addition is fluent (usually around age 6–7).",
      "Multiplication tables work best as daily 5-minute drills starting around age 7–8.",
      "Division pairs naturally with multiplication — introduce them together.",
      "Use 10–15 problems per page for younger kids, 20–30 for older ones.",
    ],
  },
  {
    name: "Sight Words",
    href: "/kids/sight-words",
    ages: "Ages 4–9",
    description:
      "Grade-level Dolch and Fry word lists with tracing and writing exercises. Builds reading fluency by making high-frequency words automatic.",
    tips: [
      "Kindergarten: start with pre-primer and primer lists (40 words).",
      "1st Grade: aim for the full first-grade list plus review of primer words.",
      "2nd–3rd Grade: focus on the less common words that trip up early readers.",
      "Practice 5 new words per week and review 10 old ones.",
    ],
  },
  {
    name: "Spelling Practice",
    href: "/kids/spelling",
    ages: "Ages 5–12",
    description:
      "Look-cover-write-check format with letter boxes and writing lines. Choose from easy, medium, and hard word lists.",
    tips: [
      "Use the look-cover-write-check method: look at the word, cover it, write from memory, then check.",
      "Easy lists work for ages 5–7, medium for 7–9, hard for 9–12.",
      "Pair spelling practice with reading — words in context stick better.",
    ],
  },
  {
    name: "Cursive Handwriting",
    href: "/kids/cursive",
    ages: "Ages 6–12",
    description:
      "Four-line guided practice sheets for lowercase letters, uppercase letters, words, and sentences.",
    tips: [
      "Begin with lowercase letters — they're used more frequently.",
      "Group letters by stroke pattern (e.g., c-a-d-g, i-t-l) rather than alphabetical order.",
      "Move to words and sentences only after individual letters are comfortable.",
      "10–15 minutes per session is plenty; longer sessions cause hand fatigue.",
    ],
  },
  {
    name: "Telling Time",
    href: "/kids/telling-time",
    ages: "Ages 5–10",
    description:
      "Practice reading analog clocks with exercises progressing from hours to half hours, quarter hours, and five-minute intervals.",
    tips: [
      "Start with hours only (ages 5–6).",
      "Add half hours once whole hours are solid (ages 6–7).",
      "Quarter hours and five-minute intervals for ages 7–9.",
      "Pair worksheets with a real analog clock for hands-on reinforcement.",
    ],
  },
  {
    name: "Money Counting",
    href: "/kids/money-counting",
    ages: "Ages 5–10",
    description:
      "Visual coin-counting exercises covering pennies, nickels, dimes, and quarters. Includes making change problems for older kids.",
    tips: [
      "Start with pennies and build up — adding coin values is more abstract than it seems.",
      "Introduce nickels and dimes once skip-counting by 5 and 10 is solid.",
      "Making change problems are appropriate for ages 8+ after coin identification is fluent.",
      "Use real coins alongside the worksheets for tactile learning.",
    ],
  },
  {
    name: "Pattern Recognition",
    href: "/kids/patterns",
    ages: "Ages 3–8",
    description:
      "Complete-the-sequence exercises with shapes, numbers, and letters across three difficulty levels.",
    tips: [
      "Shape patterns are the most accessible starting point (ages 3–5).",
      "Number patterns reinforce early math concepts (ages 5–7).",
      "Mixed patterns (combining shapes, numbers, and letters) challenge ages 7–8.",
      "Encourage kids to describe the pattern aloud before filling in the answer.",
    ],
  },
];

export default function HomeschoolWorksheetGuide() {
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
          Free Printable Worksheets for Homeschooling
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every worksheet is procedurally generated — you get fresh content each
          time, so kids never repeat the same sheet. Download as PDF for
          printing or transfer directly to an e-ink tablet.
        </p>
      </header>

      <section className="space-y-10">
        {/* Overview */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            What&rsquo;s Available
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {subjects.length} subject areas covering ages 3 through 12. Each
            worksheet includes adjustable difficulty, multiple page sizes, and
            answer keys where applicable.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            {subjects.map((s) => (
              <li key={s.name}>
                <Link
                  href={s.href}
                  className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
                >
                  {s.name}
                </Link>{" "}
                — {s.ages}
              </li>
            ))}
          </ul>
        </div>

        {/* Per-subject sections */}
        {subjects.map((s) => (
          <div key={s.name} className="border-t border-border pt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                <Link
                  href={s.href}
                  className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
                >
                  {s.name}
                </Link>
              </h2>
              <span className="text-xs text-muted-foreground shrink-0">
                {s.ages}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {s.description}
            </p>
            <h3 className="mt-4 text-sm font-semibold">
              Tips for parents
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
              {s.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* General advice */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            General Homeschool Tips
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Keep sessions short:</span>{" "}
              10–20 minutes of focused work beats an hour of distracted effort.
            </li>
            <li>
              <span className="font-medium text-foreground">Mix subjects:</span>{" "}
              Alternate between math, reading, and hands-on activities to
              maintain engagement.
            </li>
            <li>
              <span className="font-medium text-foreground">Celebrate progress:</span>{" "}
              Focus on improvement rather than perfection. Date each worksheet to
              track growth over time.
            </li>
            <li>
              <span className="font-medium text-foreground">Use answer keys wisely:</span>{" "}
              Let kids self-check first. Discuss mistakes together rather than
              just marking them wrong.
            </li>
            <li>
              <span className="font-medium text-foreground">Generate fresh sheets:</span>{" "}
              Since every PDF is unique, you can create unlimited practice without
              repetition.
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Start generating worksheets
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a subject below and create a free PDF in seconds.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/kids/math"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Math Worksheets
            </Link>
            <Link
              href="/kids/sight-words"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Sight Words
            </Link>
            <Link
              href="/kids/cursive"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Cursive Practice
            </Link>
            <Link
              href="/kids"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              All Activities →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
