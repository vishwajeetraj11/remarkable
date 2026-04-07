import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Guides — Remarkable Skills",
  description:
    "Practical guides for e-ink tablet users — transferring PDFs, choosing puzzle difficulty, ADHD-friendly productivity, and homeschool worksheets.",
  alternates: { canonical: "/guides" },
};

const guides = [
  {
    title: "How to Transfer PDFs to Your E-Ink Tablet",
    href: "/guides/transfer-pdfs-to-tablet",
    description:
      "Step-by-step instructions for USB, cloud sync, email-to-device, and third-party apps — covering reMarkable, Supernote, BOOX, and Kindle Scribe.",
  },
  {
    title: "Choosing the Right Puzzle Difficulty",
    href: "/guides/puzzle-difficulty-guide",
    description:
      "What each difficulty level means for every puzzle type, plus recommended starting levels for kids, casual solvers, and advanced players.",
  },
  {
    title: "Using Templates for ADHD-Friendly Productivity",
    href: "/guides/adhd-productivity-templates",
    description:
      "Why structured, low-friction templates help with focus and executive function — and which ones to start with.",
  },
  {
    title: "Free Printable Worksheets for Homeschooling",
    href: "/guides/printable-worksheets-for-homeschool",
    description:
      "Math, reading, spelling, cursive, telling time, money counting, and pattern worksheets organized by age and subject.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Practical tips and walkthroughs to get the most out of your e-ink
          tablet, puzzles, templates, and printable worksheets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {guides.map((guide) => (
          <Link key={guide.href} href={guide.href}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">{guide.title}</CardTitle>
                <CardDescription className="mt-1">
                  {guide.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
