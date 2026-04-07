import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const activities = [
  {
    name: "Letter Tracing",
    href: "/kids/tracing",
    desc: "Large dashed letter outlines for handwriting practice. Covers uppercase, lowercase, numbers, and simple words.",
    detail: "Uppercase · Lowercase · Numbers · Words",
    age: "Ages 3–6",
  },
  {
    name: "Math Worksheets",
    href: "/kids/math",
    desc: "Clean arithmetic practice sheets with addition, subtraction, multiplication, and division. Answer key included on the last page.",
    detail: "10–30 problems per page · single or double digit",
    age: "Ages 5–12",
  },
  {
    name: "Coloring Pages",
    href: "/kids/coloring",
    desc: "Procedurally generated geometric line art — mandalas, patterns, and simple shapes — drawn fresh every time.",
    detail: "Animals · Shapes · Nature · Patterns",
    age: "Ages 3–10",
  },
  {
    name: "Connect the Dots",
    href: "/kids/connect-dots",
    desc: "Numbered dot puzzles that reveal recognisable shapes when connected in order. Three difficulty levels.",
    detail: "Easy 10–20 · Medium 20–40 · Hard 40–60 dots",
    age: "Ages 4–10",
  },
  {
    name: "Sight Words",
    href: "/kids/sight-words",
    desc: "Practice reading and writing high-frequency sight words with tracing and writing exercises. Grade-level word banks.",
    detail: "Kindergarten · 1st · 2nd · 3rd Grade",
    age: "Ages 4–9",
  },
  {
    name: "Spelling Practice",
    href: "/kids/spelling",
    desc: "Structured spelling practice with letter boxes and writing lines. Look, cover, write, check format.",
    detail: "Easy · Medium · Hard word lists",
    age: "Ages 5–12",
  },
  {
    name: "Cursive Handwriting",
    href: "/kids/cursive",
    desc: "Guided cursive writing sheets with four-line guidelines for letters, words, and sentences.",
    detail: "Lowercase · Uppercase · Words · Sentences",
    age: "Ages 6–12",
  },
  {
    name: "Vocabulary Flashcards",
    href: "/kids/vocabulary",
    desc: "Themed vocabulary cards with words, definitions, and drawing space for visual learners.",
    detail: "Animals · Food · Nature · Body Parts",
    age: "Ages 4–10",
  },
  {
    name: "Pattern Recognition",
    href: "/kids/patterns",
    desc: "Complete the pattern exercises with shapes, numbers, and letters. Three difficulty levels.",
    detail: "Shapes · Numbers · Letters · Mixed",
    age: "Ages 3–8",
  },
  {
    name: "Telling Time",
    href: "/kids/telling-time",
    desc: "Practice reading analog clocks with exercises for hours, half hours, and five-minute intervals.",
    detail: "Hours · Half hours · Quarter hours · 5-minute",
    age: "Ages 5–10",
  },
  {
    name: "Money Counting",
    href: "/kids/money-counting",
    desc: "Learn to count coins and make change with visual coin-counting exercises.",
    detail: "Pennies · Nickels · Dimes · Quarters",
    age: "Ages 5–10",
  },
];

export default function KidsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Kids Activities</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Educational worksheets and fun activities for young learners.
          Everything is generated fresh each time so kids always have something new.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {activities.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{a.name}</CardTitle>
                  <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{a.age}</span>
                </div>
                <CardDescription className="mt-1">{a.desc}</CardDescription>
                <p className="text-xs text-muted-foreground/70 mt-2 font-mono">{a.detail}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
