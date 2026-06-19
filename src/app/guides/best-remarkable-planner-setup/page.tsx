import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Set Up the Best Planner on Your reMarkable — Remarkable Skills",
  description:
    "Build a complete planning system on your reMarkable from free templates — an all-in-one planner, a dated 2026 calendar, weekly and daily pages, and a habit tracker. Covers dated vs blank pages, hyperlinked PDFs, and how to transfer everything.",
  keywords: [
    "remarkable planner setup",
    "best remarkable planner",
    "remarkable planner template",
    "remarkable 2026 planner",
    "hyperlinked pdf planner remarkable",
    "free remarkable planner",
  ],
  alternates: { canonical: "/guides/best-remarkable-planner-setup" },
};

const layers = [
  {
    name: "All-in-One Planner",
    href: "/templates/all-in-one-planner",
    role: "Your hub",
    detail:
      "Start here. The all-in-one planner combines yearly, monthly, weekly, and daily views into a single hyperlinked PDF, so one file covers most of your planning without juggling separate documents.",
  },
  {
    name: "2026 Calendar",
    href: "/templates/calendar-2026",
    role: "The dated backbone",
    detail:
      "A fully dated year. Use it as the long-range view for deadlines, trips, and recurring commitments. Because the dates are printed, you never have to write them in by hand.",
  },
  {
    name: "Weekly Dated Planner",
    href: "/templates/weekly-dated",
    role: "Week at a glance",
    detail:
      "Each spread already carries the correct dates for the week. This is where time-blocking and weekly priorities live — the middle layer between your month and your day.",
  },
  {
    name: "Habit Tracker",
    href: "/templates/habit-tracker",
    role: "Consistency layer",
    detail:
      "A grid for the routines you want to build. Pair it with your weekly page so reviewing habits becomes part of your normal planning rhythm.",
  },
  {
    name: "Daily Focus",
    href: "/templates/daily-focus",
    role: "The execution page",
    detail:
      "One page per day for your top tasks, schedule, and notes. This is the page you actually look at while you work, kept deliberately simple so it stays useful.",
  },
];

export default function BestRemarkablePlannerSetupGuide() {
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
          How to Set Up the Best Planner on Your reMarkable
        </h1>
        <p className="mt-3 text-muted-foreground">
          The reMarkable is a brilliant planning device, but it ships with very
          little structure. This guide walks through building a complete,
          layered planning system out of free templates — from a year-at-a-glance
          calendar down to a single focused daily page.
        </p>
      </header>

      <section className="space-y-10">
        {/* Philosophy */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Think in Layers, Not One Giant File
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The best paper planning systems work because each view answers a
            different question. Your year answers &ldquo;when is it?&rdquo;, your
            week answers &ldquo;what&rsquo;s coming up?&rdquo;, and your day
            answers &ldquo;what am I doing right now?&rdquo; Recreate those layers
            on your reMarkable and you get the focus of paper without the bulk of
            five physical notebooks.
          </p>
        </div>

        {/* The stack */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            The Recommended Stack
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Five templates cover almost everyone. Add them all to your device, or
            start with the all-in-one planner and layer in the rest as you need
            them.
          </p>
        </div>

        {layers.map((l) => (
          <div key={l.name}>
            <h3 className="font-semibold">
              <Link
                href={l.href}
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                {l.name}
              </Link>{" "}
              <span className="text-sm font-normal text-muted-foreground">
                — {l.role}
              </span>
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {l.detail}
            </p>
          </div>
        ))}

        {/* Dated vs blank */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Dated vs. Blank Pages
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Dated templates print the actual date on every page, so there&rsquo;s
            no setup and no risk of skipping a day by mistake. Blank templates let
            you write the date yourself, which is ideal if you plan irregularly or
            want to reuse the same layout for years.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Choose dated</span>{" "}
              if you plan most days and want zero friction — the{" "}
              <Link
                href="/templates/calendar-2026"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                2026 calendar
              </Link>{" "}
              and{" "}
              <Link
                href="/templates/weekly-dated"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                weekly dated planner
              </Link>{" "}
              are ready to go.
            </li>
            <li>
              <span className="font-medium text-foreground">Choose blank</span>{" "}
              if you skip weekends or want a planner that never expires — print
              pages on demand from the{" "}
              <Link
                href="/templates/daily-focus"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                daily focus
              </Link>{" "}
              layout as you go.
            </li>
          </ul>
        </div>

        {/* Hyperlinked PDFs */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Why Hyperlinked PDFs Matter
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            On the reMarkable, a hyperlinked PDF lets you tap a date on the
            monthly view to jump straight to that day&rsquo;s page, then jump back.
            That navigation is what turns a stack of static pages into a planner
            that actually feels like an app. The{" "}
            <Link
              href="/templates/all-in-one-planner"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              all-in-one planner
            </Link>{" "}
            is built around this idea, with its year, month, week, and day views
            linked together.
          </p>
        </div>

        {/* Transfer */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting It Onto Your reMarkable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every template here generates a standard PDF, which reMarkable opens
            natively. Send it over USB, the reMarkable desktop or mobile app, the
            cloud, or by email-to-device. Our{" "}
            <Link
              href="/guides/transfer-pdfs-to-tablet"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              transfer guide
            </Link>{" "}
            covers each method step by step.
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Build your planner
          </h2>
          <p className="text-sm text-muted-foreground">
            Start with the hub, then add the dated calendar and weekly pages.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates/all-in-one-planner"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              All-in-One Planner
            </Link>
            <Link
              href="/templates/calendar-2026"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              2026 Calendar
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              All Templates →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
