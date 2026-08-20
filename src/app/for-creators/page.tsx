import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Creators & Press — Remarkable Skills",
  description:
    "Fact sheet for bloggers, reviewers, and roundup authors: what Remarkable Skills is, exact device resolutions supported, feature list, and ready-to-use descriptions.",
  keywords: [
    "remarkable skills press",
    "free remarkable templates generator",
    "e-ink template generator",
    "kindle scribe template generator",
    "remarkable paper pro move templates",
  ],
  alternates: { canonical: "/for-creators" },
};

const deviceMatrix = [
  {
    device: "reMarkable 2",
    screen: '10.3" monochrome',
    resolution: "1404 × 1872",
    ppi: "226",
  },
  {
    device: "reMarkable Paper Pro",
    screen: '11.8" color',
    resolution: "1620 × 2160",
    ppi: "229",
  },
  {
    device: "reMarkable Paper Pro Move",
    screen: '7.3" color',
    resolution: "954 × 1696",
    ppi: "264",
  },
  {
    device: "reMarkable Paper Pure",
    screen: '10.3" monochrome',
    resolution: "1404 × 1872",
    ppi: "226",
  },
  {
    device: "Supernote A5X",
    screen: '10.3" monochrome',
    resolution: "1404 × 1872",
    ppi: "226",
  },
  {
    device: "Supernote Manta (A5 X2)",
    screen: '10.7" monochrome',
    resolution: "1920 × 2560",
    ppi: "300",
  },
  {
    device: "BOOX Note Air",
    screen: '10.3" monochrome',
    resolution: "1404 × 1872",
    ppi: "227",
  },
  {
    device: "BOOX Tab Ultra",
    screen: '10.3" monochrome',
    resolution: "1404 × 1872",
    ppi: "227",
  },
  {
    device: "Kindle Scribe",
    screen: '10.2" monochrome',
    resolution: "1860 × 2480",
    ppi: "300",
  },
  { device: "A4 / US Letter", screen: "print", resolution: "—", ppi: "—" },
];

const features = [
  "100% free — no account, no email wall, no watermark, no page limits",
  "PDFs are generated client-side in the browser; nothing is uploaded anywhere",
  "13 procedurally generated puzzle types with answer keys — sudoku, crossword, word search, maze, nonogram, cryptogram, kakuro, kenken, futoshiki, word ladder, word scramble, number fill-in, logic puzzles",
  "65+ planner and note templates — Cornell notes, dot grid, weekly/daily planners, dated 2026 calendar, habit tracker, meal planner, ADHD daily plan, budget and finance trackers, and more",
  "12 kids activities — letter tracing, math worksheets, coloring, connect-the-dots, sight words, cursive, telling time, money counting",
  "Per-device page sizing at native aspect ratios (see matrix below)",
  "Template options: portrait/landscape, left/right-handed binding margins, ink intensity (light/regular/bold lines for e-ink contrast), line spacing, week start, custom titles, dated headers, tappable page navigation",
  "Multi-template packs and a multi-puzzle bundle builder for single-PDF downloads",
];

export default function ForCreatorsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          For Creators &amp; Press
        </h1>
        <p className="mt-3 text-muted-foreground">
          Writing a roundup of free e-ink templates, reviewing paper tablets, or
          covering tools for the reMarkable, Supernote, BOOX, or Kindle Scribe
          community? This page collects everything you need to describe
          Remarkable Skills accurately — no interview required.
        </p>
      </header>

      <section className="mb-12 border-y border-border py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Test the product first
        </p>
        <div className="mt-2 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              See exactly what readers will download
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Generate a real PDF in your browser—free, without an account,
              email gate, or watermark. Each generator includes device sizing
              and shows the output before you leave the page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Link
              href="/templates/planner"
              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Generate a planner PDF
            </Link>
            <Link
              href="/games/sudoku"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Generate a Sudoku PDF
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            What Remarkable Skills Is
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Remarkable Skills is a free generator for printable PDFs aimed at
            e-ink tablets. Instead of downloading a fixed file, you pick a
            puzzle, planner template, or kids activity, choose your device and
            options, and generate a fresh PDF in the browser. Puzzles are
            procedurally generated, so every download is unique and ships with
            an answer key. There is no account, no email capture, and no
            watermark on anything.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Feature List</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Device Matrix
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Templates are generated as PDFs sized to the native aspect ratio of
            each supported device, so pages fill the screen without cropping or
            letterboxing. Native screen resolutions for reference:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-semibold">Device</th>
                  <th className="py-2 pr-4 font-semibold">Screen</th>
                  <th className="py-2 pr-4 font-semibold">Native resolution</th>
                  <th className="py-2 font-semibold">PPI</th>
                </tr>
              </thead>
              <tbody>
                {deviceMatrix.map((d) => (
                  <tr key={d.device} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{d.device}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {d.screen}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground tabular-nums">
                      {d.resolution}
                    </td>
                    <td className="py-2 text-muted-foreground tabular-nums">
                      {d.ppi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            The reMarkable Paper Pro Move is worth a special note: free
            Move-native templates are still rare, and every template on this
            site can be generated at the Move&apos;s 954 × 1696 portrait format.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Ready-to-Use Descriptions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Feel free to copy, shorten, or adapt:
          </p>
          <div className="mt-3 space-y-3">
            <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">One-liner:</span>{" "}
              Remarkable Skills is a free generator for e-ink-ready PDFs —
              puzzles, planners, and kids activities sized natively for
              reMarkable, Supernote, BOOX, and Kindle Scribe, with no account or
              watermark.
            </blockquote>
            <blockquote className="border-l-2 border-border pl-4 text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Short:</span>{" "}
              Remarkable Skills generates unlimited free PDFs for paper tablets:
              13 puzzle types with answer keys, 65+ planner and note templates
              (Cornell, dot grid, habit trackers, a dated 2026 calendar), and 12
              kids activities. Everything is generated in the browser at your
              device&apos;s native page size — including the reMarkable Paper
              Pro Move — with options for orientation, left-handed binding
              margins, and e-ink ink intensity. No sign-up, no email wall, no
              watermark.
            </blockquote>
          </div>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Questions, corrections, or requests (screenshots, a specific
            template for testing, device-specific samples):{" "}
            <a
              href="mailto:vishwajeetraj11@gmail.com"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              vishwajeetraj11@gmail.com
            </a>
            . Happy to generate custom sample PDFs for any device you are
            testing on.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Good starting points for a hands-on look:{" "}
            <Link
              href="/templates"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              all templates
            </Link>
            ,{" "}
            <Link
              href="/games"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              all puzzles
            </Link>
            , and the{" "}
            <Link
              href="/templates/calendar-2026"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              dated 2026 calendar
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
