import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { solutionList } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Workflow Solutions — Free reMarkable PDF Generators",
  description:
    "Practical PDF generators built around real workflows: customer visits, client meetings, book writing, project tasks, and flexible planning.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Built from real requests
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
          Start with the problem. Leave with the PDF.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          These are working tools, not generic advice articles. Configure the
          page, inspect the full preview, and download a device-sized PDF.
        </p>
      </div>

      <div className="mt-16 border-y border-border">
        {solutionList.map((solution, index) => (
          <Link
            key={solution.slug}
            href={`/solutions/${solution.slug}`}
            className="group grid gap-4 border-b border-border py-8 last:border-b-0 md:grid-cols-[4rem_1fr_1fr_auto] md:items-center"
          >
            <span className="text-sm tabular-nums text-muted-foreground">
              0{index + 1}
            </span>
            <h2 className="text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
              {solution.shortTitle}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {solution.promise}
            </p>
            <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </main>
  );
}
