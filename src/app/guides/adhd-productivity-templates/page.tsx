import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Using Templates for ADHD-Friendly Productivity — Remarkable Skills",
  description:
    "How structured, low-friction templates help with ADHD focus and executive function. Covers the Low-Friction Daily Plan, 3 Priorities, Brain Dump, Shutdown Checklist, and Routine Tracker.",
  alternates: { canonical: "/guides/adhd-productivity-templates" },
};

const templates = [
  {
    name: "Low-Friction Daily Plan",
    href: "/templates/daily-plan-adhd",
    why: "Replaces the blank-page problem with a single energy check and one big thing. No elaborate scheduling — just enough structure to get moving.",
    tip: "Fill in the energy check first. If energy is low, give yourself permission to shrink the list.",
  },
  {
    name: "3 Priorities",
    href: "/templates/three-priorities",
    why: "Limits your day to three items so decision fatigue never kicks in. The constraint is the feature — you can't over-commit on paper.",
    tip: "Pick your three the night before. Morning brain is already depleted by choosing.",
  },
  {
    name: "Brain Dump",
    href: "/templates/brain-dump",
    why: "A safe space to offload every thought, task, and worry. The dump-then-sort format turns mental clutter into actionable categories.",
    tip: "Set a 5-minute timer. Write everything — don't filter. Sort after the timer rings.",
  },
  {
    name: "Shutdown Checklist",
    href: "/templates/shutdown-checklist",
    why: "Closing loops is hard with ADHD. A physical end-of-day checklist signals your brain that work is done, reducing rumination.",
    tip: "Keep it short — 5 to 7 items max. Review tomorrow's top priority as the last step.",
  },
  {
    name: "Routine Tracker",
    href: "/templates/routine-tracker",
    why: "Visual streak tracking leverages the reward circuit. Checking a box feels good and builds momentum for repetitive tasks that ADHD brains resist.",
    tip: "Start with 3 habits, not 10. Expansion comes after consistency.",
  },
];

export default function AdhdProductivityGuide() {
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
          Using Templates for ADHD-Friendly Productivity
        </h1>
        <p className="mt-3 text-muted-foreground">
          Digital tools have infinite flexibility — which is exactly the problem.
          Paper templates on an e-ink tablet give you just enough structure
          without the distractions.
        </p>
      </header>

      <section className="space-y-10">
        {/* Why templates help */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Why Structure Helps with ADHD
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            ADHD affects executive function — the brain&rsquo;s ability to plan,
            prioritize, and follow through. Blank pages and open-ended apps
            amplify this challenge by demanding decisions before you can start.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Reduces decision fatigue:</span>{" "}
              Pre-built sections tell you exactly what to write and where.
            </li>
            <li>
              <span className="font-medium text-foreground">Lowers activation energy:</span>{" "}
              Filling in a field is easier than creating a system from scratch.
            </li>
            <li>
              <span className="font-medium text-foreground">Externalizes working memory:</span>{" "}
              You don&rsquo;t have to hold the plan in your head — it&rsquo;s on
              the page.
            </li>
            <li>
              <span className="font-medium text-foreground">Creates closure rituals:</span>{" "}
              Checklists and end-of-day routines help the brain transition out of
              work mode.
            </li>
          </ul>
        </div>

        {/* E-ink advantage */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Why E-Ink Works Better Than Apps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Phones and laptops are attention traps. E-ink tablets remove
            notifications, social media, and browser tabs from the equation.
            Writing by hand also engages deeper processing than typing.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>No notifications or app-switching temptation</li>
            <li>Handwriting strengthens memory encoding</li>
            <li>E-ink is gentle on eyes — usable for longer sessions</li>
            <li>Physical act of checking a box triggers dopamine reward</li>
          </ul>
        </div>

        {/* Recommended templates */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Recommended Templates
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            These five templates are designed for low friction and high clarity.
            Each one addresses a specific ADHD challenge.
          </p>
        </div>

        {templates.map((t) => (
          <div key={t.name}>
            <h3 className="font-semibold">
              <Link
                href={t.href}
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                {t.name}
              </Link>
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {t.why}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Tip:</span>{" "}
              <span className="text-muted-foreground">{t.tip}</span>
            </p>
          </div>
        ))}

        {/* Getting started */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Getting Started
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Week 1:</span> Use
              the Low-Friction Daily Plan every morning. Don&rsquo;t add anything
              else.
            </li>
            <li>
              <span className="font-medium text-foreground">Week 2:</span> Add
              the Shutdown Checklist in the evening.
            </li>
            <li>
              <span className="font-medium text-foreground">Week 3:</span>{" "}
              Introduce the Routine Tracker with 3 small habits.
            </li>
            <li>
              <span className="font-medium text-foreground">Week 4:</span> Try
              the Brain Dump whenever you feel overwhelmed.
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            There&rsquo;s no wrong way to use these. The goal is consistency, not
            perfection.
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Try these templates
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates/daily-plan-adhd"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Low-Friction Daily Plan
            </Link>
            <Link
              href="/templates/three-priorities"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              3 Priorities
            </Link>
            <Link
              href="/templates/brain-dump"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Brain Dump
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Or browse the full{" "}
            <Link
              href="/templates"
              className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              Focus / ADHD-Friendly pack
            </Link>{" "}
            with all 6 templates.
          </p>
        </div>
      </section>
    </article>
  );
}
