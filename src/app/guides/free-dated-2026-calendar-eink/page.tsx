import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Dated 2026 Calendar for E-Ink Tablets — Remarkable Skills",
  description:
    "Download a free, fully dated 2026 calendar PDF for reMarkable, Supernote, BOOX, and Kindle Scribe. Choose a Sunday or Monday week start, pick monthly or weekly layouts, and learn how to get it onto your e-ink tablet.",
  keywords: [
    "free 2026 calendar",
    "dated 2026 calendar pdf",
    "remarkable 2026 calendar",
    "e-ink calendar template",
    "supernote calendar",
    "kindle scribe calendar",
  ],
  alternates: { canonical: "/guides/free-dated-2026-calendar-eink" },
};

const devices = [
  {
    name: "reMarkable 1 / 2 / Paper Pro",
    detail:
      "Add the PDF via USB, the reMarkable desktop or mobile app, the cloud, or email-to-device. Hyperlinked dates let you tap a day to jump to its page.",
  },
  {
    name: "Supernote A5 X / A6 X",
    detail:
      "Drop the PDF into the Document folder over USB or through Supernote Partner. Open it as a regular PDF and annotate directly on the page.",
  },
  {
    name: "BOOX (Note, Tab, Air)",
    detail:
      "Copy the file via USB or BOOXDrop, then open it in the built-in NeoReader or any PDF app. Layers and handwriting are supported.",
  },
  {
    name: "Kindle Scribe",
    detail:
      "Use Send to Kindle (web, email, or app) to push the PDF to your device, then write on it as a document.",
  },
];

export default function FreeDated2026CalendarGuide() {
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
          Free Dated 2026 Calendar for E-Ink Tablets
        </h1>
        <p className="mt-3 text-muted-foreground">
          A fully dated 2026 calendar you can generate as a clean PDF and use on
          any e-ink tablet — no subscription, no account, no watermark. This
          guide explains the layout options and how to get it onto your device.
        </p>
      </header>

      <section className="space-y-10">
        {/* What it is */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            What You Get
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The{" "}
            <Link
              href="/templates/calendar-2026"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              2026 calendar template
            </Link>{" "}
            generates a complete year with every date already printed. There is
            nothing to set up day by day — open it and start writing. Because it
            exports as a standard PDF, it works the same on every e-ink tablet and
            prints cleanly if you want a paper copy too.
          </p>
        </div>

        {/* Week start */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Sunday or Monday Week Start
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Week-start preference is personal and regional. Pick whichever
            matches how you think about your week — the calendar lays out the days
            accordingly so the grid always lines up with your mental model.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">Sunday start:</span>{" "}
              common in the US and Canada; keeps the full weekend grouped at the
              edges of the row.
            </li>
            <li>
              <span className="font-medium text-foreground">Monday start:</span>{" "}
              standard across Europe and the ISO week; keeps the work week
              together with the weekend on the right.
            </li>
          </ul>
        </div>

        {/* Layouts */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Monthly and Weekly Layouts
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            A dated year is most useful when paired with closer-in views. Use the
            month grid for the overview, then drop into a week for the detail.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <Link
                href="/templates/monthly-calendar"
                className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Monthly calendar
              </Link>{" "}
              — a classic month grid for deadlines, events, and an at-a-glance
              view of the weeks ahead.
            </li>
            <li>
              <Link
                href="/templates/weekly-dated"
                className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                Weekly dated planner
              </Link>{" "}
              — each spread already carries the correct dates, ideal for
              time-blocking and weekly priorities.
            </li>
          </ul>
        </div>

        {/* Devices */}
        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            How to Get It on Your Tablet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate the PDF, then transfer it using the method your device
            supports.
          </p>
        </div>

        {devices.map((d) => (
          <div key={d.name}>
            <h3 className="font-semibold">{d.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {d.detail}
            </p>
          </div>
        ))}

        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For a full walkthrough of USB, cloud, email-to-device, and app-based
            transfers across every major brand, see the{" "}
            <Link
              href="/guides/transfer-pdfs-to-tablet"
              className="font-medium text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              transfer guide
            </Link>
            .
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-border pt-10 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Get your 2026 calendar
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/templates/calendar-2026"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              2026 Calendar
            </Link>
            <Link
              href="/templates/weekly-dated"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Weekly Dated Planner
            </Link>
            <Link
              href="/templates/monthly-calendar"
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium border border-foreground/12 transition-all hover:bg-foreground/4 active:scale-[0.98]"
            >
              Monthly Calendar
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
