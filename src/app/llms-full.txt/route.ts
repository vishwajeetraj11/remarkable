import { SITE_URL } from "@/lib/site-url";
import {
  gameRoutes,
  kidsRoutes,
  guideRoutes,
  packRoutes,
  labelForPath,
} from "@/lib/site-map";
import { TEMPLATE_PACKS } from "@/lib/templates/catalog";
import {
  GAME_DESCRIPTIONS,
  KIDS_DESCRIPTIONS,
  GUIDE_DESCRIPTIONS,
  PACK_DESCRIPTIONS,
} from "@/lib/llm-content";

// Prerendered at build time so the file is always in sync with the route map
// and template catalog of the deployed build — no runtime cost, no drift.
export const dynamic = "force-static";

function section(
  title: string,
  intro: string,
  routes: { path: string; label?: string }[],
  descriptions: Record<string, string>
): string {
  const lines = [`## ${title}`, "", intro, ""];
  for (const route of routes) {
    const desc =
      descriptions[route.path] ??
      `${labelForPath(route.path)} — free printable PDF generator.`;
    lines.push(
      `- [${labelForPath(route.path)}](${SITE_URL}${route.path}): ${desc}`
    );
  }
  lines.push("");
  return lines.join("\n");
}

function generateLlmsFull(): string {
  const parts: string[] = [];

  parts.push(`# Remarkable Skills — Full Content Index

> Complete page-by-page index of Remarkable Skills (${SITE_URL}) for LLM ingestion. Free, procedurally generated puzzles, templates, and printable activities optimized for the reMarkable paper tablet (reMarkable 2, Paper Pro) and other e-ink devices (Supernote, BOOX, Kindle Scribe), plus A4/Letter printing. All PDFs are generated client-side in the browser — no account required.

Generated automatically from the site route map at build time.
`);

  parts.push(`## About

Remarkable Skills generates printable PDFs entirely in the browser using jsPDF. Content areas:

1. **Puzzle Games** — ${gameRoutes.length} generator pages across sudoku (4 grid sizes with book mode), crosswords, word searches, mazes, nonograms, cryptograms, kakuro, kenken, futoshiki, word ladders, number fill, and logic puzzles.
2. **Templates** — ${TEMPLATE_PACKS.reduce((a, p) => a + p.templates.length, 0)}+ templates grouped into curated bundles (Meeting System, Semester Success, Budget Calendar) covering planning, meetings, ADHD support, study, finance, wellness, and home life.
3. **Kids Activities** — printable worksheets: math drills, tracing, sight words, spelling, cursive, vocabulary, patterns, telling time, money counting.
4. **Guides** — transfer instructions, homeschool worksheets, ADHD productivity, planner setups.
5. **Puzzle Packs** — themed multi-activity bundles.

Every generator supports device-specific page sizes (reMarkable 2/Paper Pure 1404×1872, Paper Pro 1620×2160, Paper Pro Move, Supernote A5X/Manta, BOOX Note Air/Tab Ultra, Kindle Scribe 1860×2480, A4, US Letter), portrait/landscape orientation, and left/right-handed binding margins where applicable.
`);

  parts.push(
    section(
      "Puzzle Games",
      "Procedurally generated puzzle PDFs. Each download is unique.",
      gameRoutes,
      GAME_DESCRIPTIONS
    )
  );

  // Templates come straight from the catalog so new templates are never missing.
  parts.push("## Printable Templates\n");
  parts.push(
    "Sized precisely for reMarkable 2, Paper Pro, Supernote, BOOX, Kindle Scribe, A4, and Letter. Portrait/landscape and left/right-handed margins configurable.\n"
  );
  for (const pack of TEMPLATE_PACKS) {
    parts.push(`### ${pack.name} (${pack.badge})\n`);
    parts.push(`${pack.description}\n`);
    for (const tpl of pack.templates) {
      parts.push(`- [${tpl.name}](${SITE_URL}${tpl.href}): ${tpl.desc}`);
    }
    parts.push("");
  }

  parts.push(
    section(
      "Kids Activities",
      "Printable educational worksheets and activities for children ages 3–12.",
      kidsRoutes,
      KIDS_DESCRIPTIONS
    )
  );

  parts.push(
    section(
      "Guides",
      "Practical guides for e-ink tablet owners, students, and families.",
      guideRoutes,
      GUIDE_DESCRIPTIONS
    )
  );

  parts.push(
    section(
      "Puzzle Packs",
      "Themed multi-puzzle PDF bundles configured once and downloaded together.",
      packRoutes,
      PACK_DESCRIPTIONS
    )
  );

  parts.push(`## Optional

- [Curated index](https://${SITE_URL.replace(/^https?:\/\//, "")}/llms.txt): Short overview of the site for LLMs.
- [Sitemap](https://${SITE_URL.replace(/^https?:\/\//, "")}/sitemap.xml): Full XML sitemap.
`);

  return parts.join("\n");
}

export async function GET() {
  return new Response(generateLlmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
