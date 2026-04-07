import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Games & Puzzles",
    description: "Infinite procedurally generated puzzles with answer keys",
    href: "/games",
    badge: "60+ types",
    items: [
      { name: "Sudoku", href: "/games/sudoku", desc: "Easy to evil difficulty" },
      { name: "Word Search", href: "/games/word-search", desc: "Themed categories" },
      { name: "Crossword", href: "/games/crossword", desc: "Auto-generated clues" },
      { name: "Maze", href: "/games/maze", desc: "Multiple sizes & styles" },
      { name: "Nonogram", href: "/games/nonogram", desc: "Pixel logic puzzles" },
      { name: "Word Scramble", href: "/games/word-scramble", desc: "Unscramble the letters" },
    ],
  },
  {
    title: "Templates",
    description: "Customizable templates optimized for e-ink",
    href: "/templates",
    badge: "Customizable",
    items: [
      { name: "Weekly Planner", href: "/templates/planner", desc: "Plan your week" },
      { name: "Dot Grid", href: "/templates/dot-grid", desc: "Bullet journal style" },
      { name: "Lined Paper", href: "/templates/lined", desc: "Adjustable spacing" },
      { name: "Cornell Notes", href: "/templates/cornell", desc: "Study & review" },
    ],
  },
  {
    title: "Kids",
    description: "Educational activities and fun for younger users",
    href: "/kids",
    badge: "Ages 3-12",
    items: [
      { name: "Letter Tracing", href: "/kids/tracing", desc: "Learn handwriting" },
      { name: "Math Worksheets", href: "/kids/math", desc: "Addition to division" },
      { name: "Coloring Pages", href: "/kids/coloring", desc: "Line art for e-ink" },
      { name: "Connect the Dots", href: "/kids/connect-dots", desc: "Numbered dot puzzles" },
    ],
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02),transparent_70%)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Free puzzles & templates for your{" "}
              <span className="text-muted-foreground">reMarkable</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Procedurally generated sudoku, crosswords, mazes, planners, and
              more. Customize, download as PDF, and transfer to your tablet.
              Always free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Browse Puzzles
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                View Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="space-y-16">
          {sections.map((section) => (
            <div key={section.href}>
              <div className="flex items-center gap-3 mb-6">
                <Link href={section.href}>
                  <h2 className="text-2xl font-semibold tracking-tight hover:underline">
                    {section.title}
                  </h2>
                </Link>
                <Badge variant="secondary">{section.badge}</Badge>
              </div>
              <p className="text-muted-foreground mb-6">
                {section.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {item.name}
                        </CardTitle>
                        <CardDescription>{item.desc}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose & customize",
                desc: "Pick a puzzle or template and adjust difficulty, size, and style to your preference.",
              },
              {
                step: "2",
                title: "Generate PDF",
                desc: "We generate a fresh, unique PDF every time — optimized for the reMarkable's e-ink display.",
              },
              {
                step: "3",
                title: "Transfer & enjoy",
                desc: "Download the PDF and transfer it to your reMarkable via USB, cloud, or the mobile app.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
