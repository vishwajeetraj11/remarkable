import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bullet Journaling on a reMarkable Tablet — Remarkable Skills",
  description:
    "A practical guide to bullet journaling (BuJo) on a reMarkable. Covers the key and signifiers, the index, future/monthly/daily logs, collections, why e-ink suits the method, and which dot-grid and tracker templates to use.",
  keywords: [
    "bullet journaling remarkable",
    "bujo remarkable",
    "digital bullet journal e-ink",
    "remarkable dot grid",
    "bullet journal template",
    "bujo trackers",
  ],
  alternates: { canonical: "/guides/bullet-journaling-on-remarkable" },
};

const components = [
  {
    name: "Index",
    detail:
      "A running table of contents at the front of your journal. As you add collections and monthly logs, you record their page numbers here so nothing gets lost. On the reMarkable, this pairs naturally with hyperlinks.",
  },
  {
    name: "Future Log",
    detail:
      "A spread for the months ahead. Capture appointments, birthdays, and deadlines that fall outside the current month, then migrate them into the right monthly log when the time comes.",
  },
  {
    name: "Monthly Log",
    detail:
      "A calendar view plus a task list for the month. It answers what is happening and what needs doing at a glance before you drop into individual days.",
  },
  {
    name: "Daily Log",
    detail:
      "The heart of rapid logging. Each day you jot tasks, events, and notes as bullets, marking them with signifiers as their status changes. No pre-printed structure required — you write the date and go.",
  },
  {
    name: "Collections",
    detail:
      "Themed pages for anything that does not fit a date — book lists, project plans, habit grids, packing lists. Collections are where a bullet journal becomes truly personal.",
  },
];

export default function BulletJournalingOnRemarkableGuide() {
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
          Bullet Journaling on a reMarkable Tablet
        </h1>
        <p className="mt-3 text-muted-foreground">
          Bullet journaling (BuJo) is an analog method for tracking the past,
          organizing the present, and planning the future — all in one notebook.
          An e-ink tablet keeps that hand-written feel while adding endless pages
          and tap-to-navigate links. Here&rsquo;s how to run a real BuJo on a
          reMarkable.
        </p>
      </header>

      <section className="space-y-10">
        {/* The key */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Start With a Key and Signifiers
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Rapid logging relies on a small set of symbols so you can capture
            things fast and read them back at a glance. Define your key on the
            first page so it&rsquo;s always available.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Dot</span> — a task to
              do.
            </li>
            <li>
              <span className="font-medium text-foreground">X</span> — a task
              completed.
            </li>
            <li>
              <span className="font-medium text-foreground">&gt;</span> — a task
              migrated to a later log.
            </li>
            <li>
              <span className="font-medium text-foreground">&lt;</span> — a task
              scheduled into the future log.
            </li>
            <li>
              <span className="font-medium text-foreground">○</span> — an event.
            </li>
            <li>
              <span className="font-medium text-foreground">—</span> — a note.
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Signifiers like a star (priority) or an exclamation mark (inspiration)
            sit alongside bullets to add emphasis without a second system.
          </p>
        </div>

        {/* Core components */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            The Core Components
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A bullet journal is built from a handful of repeating structures. Set
            them up once and the method runs itself.
          </p>
        </div>

        {components.map((c) => (
          <div key={c.name}>
            <h3 className="font-semibold">{c.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {c.detail}
            </p>
          </div>
        ))}

        {/* Why e-ink */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Why E-Ink Suits Bullet Journaling
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The whole point of BuJo is to slow down and think with your hand. An
            e-ink tablet keeps that tactile, distraction-free writing experience
            while solving the two biggest pain points of paper journals: running
            out of pages and losing the index.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>Unlimited pages — no more rationing space in a finished notebook.</li>
            <li>
              Hyperlinks turn your index into tappable navigation instead of
              flipping pages.
            </li>
            <li>No notifications or apps to pull you out of the flow.</li>
            <li>Erase and move things cleanly without scribbles or whiteout.</li>
          </ul>
        </div>

        {/* Dot grid + templates */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Use Dot-Grid and Ready-Made Pages
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Traditional bullet journals use a dot grid because the dots guide your
            spacing without boxing you in — perfect for mixing text, lists, and
            simple layouts on the same page.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <Link
                href="/templates/bullet-journal"
                className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Bullet journal template
              </Link>{" "}
              — a structured BuJo starting point with the core logs ready to go.
            </li>
            <li>
              <Link
                href="/templates/dot-grid"
                className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Dot grid
              </Link>{" "}
              — blank dot-grid pages for building your own custom collections and
              spreads.
            </li>
            <li>
              Add trackers as collections:{" "}
              <Link
                href="/templates/habit-tracker"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                habit tracker
              </Link>
              ,{" "}
              <Link
                href="/templates/mood-tracker"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                mood tracker
              </Link>
              , and{" "}
              <Link
                href="/templates/gratitude-journal"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                gratitude journal
              </Link>
              .
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Start your bullet journal
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate a PDF, send it to your tablet, and rapid-log your first day.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates/bullet-journal"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Bullet Journal
            </Link>
            <Link
              href="/templates/dot-grid"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Dot Grid
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
