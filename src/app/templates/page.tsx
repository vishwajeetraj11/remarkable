import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const templates = [
  {
    name: "Weekly Planner",
    href: "/templates/planner",
    desc: "Weekly layout with days as columns and optional hourly time slots. Great for scheduling and task management.",
    detail: "1–12 weeks · time slots · custom start date",
  },
  {
    name: "Dot Grid",
    href: "/templates/dot-grid",
    desc: "Evenly spaced dots across the page — the bullet journal staple. Unobtrusive guides that disappear when you write.",
    detail: "3–8 mm spacing · small or medium dots",
  },
  {
    name: "Lined Paper",
    href: "/templates/lined",
    desc: "Classic horizontal lines with adjustable spacing, optional left margin, and optional header zone.",
    detail: "Narrow / College / Wide ruling · margin toggle",
  },
  {
    name: "Cornell Notes",
    href: "/templates/cornell",
    desc: "Two-column layout perfect for studying and reviewing. Cue column on the left, notes on the right, summary at the bottom.",
    detail: "Slim / Standard / Wide cue column · summary toggle",
  },
];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Customizable templates optimized for the reMarkable&apos;s e-ink display.
          Adjust spacing, sizing, and layout, then download a clean PDF ready to
          transfer to your tablet.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {templates.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription className="mt-1">{t.desc}</CardDescription>
                <p className="text-xs text-muted-foreground/70 mt-2 font-mono">{t.detail}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
