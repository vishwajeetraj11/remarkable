import type { Metadata } from "next";
import Link from "next/link";
import { TemplateDiscovery } from "@/components/templates/template-discovery";
import { getTemplatesByHref } from "@/lib/templates/catalog";

export const metadata: Metadata = {
  title: "Best Free reMarkable Templates in 2026 — Remarkable Skills",
  description:
    "Where to actually get free templates for the reMarkable 2, Paper Pro, Paper Pro Move, and Paper Pure in 2026 — generators, official sources, and community libraries, plus what to check before you download.",
  keywords: [
    "free remarkable templates",
    "remarkable 2 templates free",
    "remarkable paper pro templates",
    "remarkable paper pro move templates",
    "remarkable paper pure templates",
    "free remarkable planner",
  ],
  alternates: { canonical: "/guides/best-free-remarkable-templates-2026" },
};

const checklist = [
  {
    title: "Device-native sizing",
    detail:
      "reMarkable 2 and Paper Pure are 1404×1872 (226 PPI), Paper Pro is 1620×2160 (229 PPI), and the Paper Pro Move is 954×1696 (264 PPI). A template at the wrong size gets scaled by the device, which softens lines. If a source doesn't say which size a file is, assume it was made for the rM2.",
  },
  {
    title: "Grey lines, not black",
    detail:
      "Form lines at 30–40% grey recede behind your handwriting on e-ink; pure black lines compete with it. Well-made templates use grey structural lines.",
  },
  {
    title: "PDF vs PNG",
    detail:
      "PDFs import as writable documents through the reMarkable app or USB. PNGs are for installing as notebook templates (via RCU, SSH, or reMarkable's own template support). Know which workflow you want before downloading.",
  },
  {
    title: "Actually free",
    detail:
      "Many \"free templates\" pages are samples for a paid pack, or require an email address. Check whether the download has strings attached before investing time.",
  },
];

const GUIDE_RECOMMENDATIONS = getTemplatesByHref([
  "/templates/calendar-2026",
  "/templates/planner",
  "/templates/semester-planner",
  "/templates/literature-review-matrix",
]);

export default function BestFreeRemarkableTemplatesGuide() {
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
          Best Free reMarkable Templates in 2026
        </h1>
        <p className="mt-3 text-muted-foreground">
          The honest map of where free reMarkable templates actually come from
          in 2026 — including this site, which is one of the options below. What
          each source is good for, and what to check before you download.
        </p>
      </header>

      <section className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            1. Generators (unlimited, device-sized)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Generators build a fresh PDF to your specification instead of
            handing you a fixed file. The advantage is sizing and options: pick
            your exact device, orientation, and layout preferences, and the
            output matches your screen natively.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>
              <span className="font-medium text-foreground">
                This site (Remarkable Skills)
              </span>{" "}
              — 65+{" "}
              <Link
                href="/templates"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                planner and note templates
              </Link>
              , 13{" "}
              <Link
                href="/games"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                puzzle generators
              </Link>
              , and{" "}
              <Link
                href="/kids"
                className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
              >
                kids activities
              </Link>
              , all free with no account or watermark. Supports every current
              reMarkable — including 954×1696 output for the Paper Pro Move,
              which almost no free source covers — plus Supernote, BOOX, Kindle
              Scribe, A4, and Letter.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Single-purpose generators
              </span>{" "}
              — tools like sudokupdfmaker.com (sudoku only) or
              noteworthwhile.com&apos;s planner builder (planners only) do one
              thing each and do it for free. Useful if you want exactly that one
              thing.
            </li>
          </ul>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            A curated starter set
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Start with these four device-sized generators, then add the one
            that matches how you plan, study, or take notes.
          </p>
          <div className="mt-6">
            <TemplateDiscovery
              templates={GUIDE_RECOMMENDATIONS}
              sourcePage="/guides/best-free-remarkable-templates-2026"
              placement="guide_recommendations"
            />
          </div>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            2. reMarkable&apos;s Own Templates
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Every reMarkable ships with a built-in template library (lined, dot
            grid, planners, storyboards, music sheets), and reMarkable&apos;s
            Methods program adds downloadable template packs from partner
            creators — some free, some behind the Connect subscription. These
            install as true notebook templates rather than imported PDFs, which
            is the smoothest workflow the device supports. The catch: the
            selection is curated and slow-moving, and dated planners are mostly
            paid.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            3. Community Libraries
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            r/RemarkableTablet threads and GitHub repositories host hundreds of
            community-made templates, free with no strings. Quality and sizing
            vary — most predate the Paper Pro and Move, so files are typically
            1404×1872 rM2-format — but the best community templates are genuinely
            excellent, and comment threads tell you which ones work before you
            download.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            4. Template Shops&apos; Free Sections
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Paid template shops (Etsy sellers, Templacity, onplanners, and
            others) usually publish a handful of free samples. These are often
            polished — they are advertising, after all — but limited in scope,
            and the dated or full versions cost money. Fine as a way to try a
            designer&apos;s style before buying.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            What to Check Before Downloading
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {checklist.map((item) => (
              <li key={item.title} className="pl-5 relative">
                <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground/40" />
                <span className="font-medium text-foreground">
                  {item.title}.
                </span>{" "}
                {item.detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            The Paper Pro Move Gap
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The Move&apos;s 7.3&quot; screen (954×1696 portrait) is the newest
            format in the lineup, and nearly all free template sources still
            only publish rM2-sized files — which get cropped or scaled on the
            Move. If you have a Move, use a generator that outputs the native
            size, or check explicitly for Move-format files before downloading.
            Every template on this site can be generated at Move-native
            dimensions.
          </p>
        </div>

        <div className="border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Where to Start
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            A solid free starter setup:{" "}
            <Link
              href="/templates/calendar-2026"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              dated 2026 calendar
            </Link>
            ,{" "}
            <Link
              href="/templates/planner"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              weekly planner
            </Link>
            ,{" "}
            <Link
              href="/templates/habit-tracker"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              habit tracker
            </Link>
            , and{" "}
            <Link
              href="/templates/cornell"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              Cornell notes
            </Link>
            . For the transfer step, see{" "}
            <Link
              href="/guides/transfer-pdfs-to-tablet"
              className="underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-colors"
            >
              how to transfer PDFs to your tablet
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
