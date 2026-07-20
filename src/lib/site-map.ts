/**
 * Single source of truth for the site's public route map.
 *
 * Hand-maintained route lists used to live inline in `src/app/sitemap.ts` and
 * drifted from the actual `src/app/**` folders. This module centralizes every
 * public route with sitemap-relevant metadata so `sitemap.ts` (and future
 * features such as internal-linking and breadcrumbs) can derive from one typed
 * source instead of duplicating string arrays.
 *
 * When you add a new public page under `src/app/**`, add its path here.
 */

import type { MetadataRoute } from "next";

/** Sitemap change-frequency values supported by Next's `MetadataRoute.Sitemap`. */
export type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

/** A single public route plus the metadata sitemaps care about. */
export type Route = {
  /** Absolute path beginning with `/` (e.g. `/games/sudoku/easy`). */
  path: string;
  changeFrequency: ChangeFrequency;
  /** 0.0–1.0 sitemap priority. */
  priority: number;
  /**
   * Human-readable label for this route, used by breadcrumbs and
   * internal-linking UI (e.g. `/games/sudoku` → "Sudoku"). When omitted,
   * `labelForPath` falls back to a title-cased last path segment.
   */
  label?: string;
};

/** A logical grouping of routes (e.g. all games, all templates). */
export type Section = {
  id: "home" | "games" | "templates" | "kids" | "guides" | "packs";
  /** The section's index/landing route, if any (e.g. `/games`). */
  index: Route | null;
  /** Detail/sub routes that belong to the section. */
  routes: Route[];
};

// ─── Priority + change-frequency presets ─────────────────────────────────────
// Mirrors what sitemap.ts historically assigned:
//   home 1.0, section index 0.8, detail page 0.7, guide 0.6.

const HOME = { changeFrequency: "weekly", priority: 1.0 } as const;
const INDEX = { changeFrequency: "weekly", priority: 0.8 } as const;
const DETAIL = { changeFrequency: "monthly", priority: 0.7 } as const;
const GUIDE = { changeFrequency: "monthly", priority: 0.6 } as const;

const index = (path: string): Route => ({ path, ...INDEX, label: labelFor(path) });
const detail = (path: string): Route => ({ path, ...DETAIL, label: labelFor(path) });
const guide = (path: string): Route => ({ path, ...GUIDE, label: labelFor(path) });

// ─── Human-readable labels ───────────────────────────────────────────────────
// Breadcrumb/internal-linking label source (flagged in task 2.1). Most labels
// are derived from the slug via title-casing; only paths whose title-cased slug
// is wrong or awkward need an explicit override below.

/** Title-cases a path's last segment (e.g. `/games/word-search` → "Word Search"). */
function titleCaseSlug(path: string): string {
  const slug = path.split("/").filter(Boolean).pop() ?? "";
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Explicit label overrides for paths whose title-cased slug would be wrong,
 * abbreviated, or awkward. Anything not listed falls back to `titleCaseSlug`.
 */
const LABEL_OVERRIDES: Record<string, string> = {
  "/": "Home",
  "/games": "Games",
  "/templates": "Templates",
  "/kids": "Kids",
  "/guides": "Guides",
  "/packs": "Packs",
  "/packs/logic-masters": "Logic Masters Pack",
  "/packs/word-games": "Word Games Pack",
  // Games
  "/games/kenken": "KenKen",
  "/games/futoshiki": "Futoshiki",
  // Templates
  "/templates/all-in-one-planner": "All-in-One Planner",
  "/templates/project-planner": "Project Planner",
  "/templates/bullet-journal": "Bullet Journal",
  "/templates/calendar-2026": "2026 Calendar",
  "/templates/weekly-dated": "Weekly Dated Planner",
  "/templates/debt-tracker": "Debt Tracker",
  "/templates/sinking-funds": "Sinking Funds",
  "/templates/net-worth": "Net Worth",
  "/templates/one-on-one": "One-on-One",
  "/templates/daily-plan-adhd": "Daily Plan (ADHD)",
  "/templates/workout-log": "Workout Log",
  "/templates/mcp-docs": "MCP Docs",
  // Kids
  "/kids/math/custom": "Custom",
  "/kids/sight-words/1st-grade": "1st Grade",
  "/kids/sight-words/2nd-grade": "2nd Grade",
  "/kids/sight-words/3rd-grade": "3rd Grade",
  // Guides
  "/guides/transfer-pdfs-to-tablet": "Transfer PDFs to Tablet",
  "/guides/printable-worksheets-for-homeschool": "Printable Worksheets for Homeschool",
  "/guides/adhd-productivity-templates": "ADHD Productivity Templates",
  "/guides/puzzle-difficulty-guide": "Puzzle Difficulty Guide",
  "/guides/best-remarkable-planner-setup": "Best reMarkable Planner Setup",
  "/guides/free-dated-2026-calendar-eink": "Free Dated 2026 Calendar",
  "/guides/bullet-journaling-on-remarkable": "Bullet Journaling on reMarkable",
};

/** Resolve a label for a path: explicit override, else title-cased slug. */
function labelFor(path: string): string {
  return LABEL_OVERRIDES[path] ?? titleCaseSlug(path);
}

// ─── Source data ─────────────────────────────────────────────────────────────
// Keep these arrays in sync with `src/app/<section>/**/page.tsx`.

const HOME_ROUTE: Route = { path: "/", ...HOME, label: labelFor("/") };

/** Game slugs whose page lives at `/games/<slug>` (+ explicit sub-routes). */
const GAME_PATHS = [
  "/games/sudoku",
  "/games/sudoku/easy",
  "/games/sudoku/medium",
  "/games/sudoku/hard",
  "/games/sudoku/evil",
  "/games/word-search",
  "/games/word-search/custom",
  "/games/crossword",
  "/games/crossword/custom",
  "/games/maze",
  "/games/nonogram",
  "/games/word-scramble",
  "/games/cryptogram",
  "/games/kakuro",
  "/games/kenken",
  "/games/futoshiki",
  "/games/word-ladder",
  "/games/number-fill",
  "/games/logic-puzzle",
];

const TEMPLATE_PATHS = [
  "/templates/all-in-one-planner",
  "/templates/yearly-roadmap",
  "/templates/quarterly-goals",
  "/templates/monthly-calendar",
  "/templates/calendar-2026",
  "/templates/planner",
  "/templates/weekly-dated",
  "/templates/daily-focus",
  "/templates/inbox-capture",
  "/templates/lined",
  "/templates/dot-grid",
  "/templates/grid",
  "/templates/cornell",
  "/templates/meeting-notes",
  "/templates/one-on-one",
  "/templates/client-call",
  "/templates/project-brief",
  "/templates/decision-log",
  "/templates/action-tracker",
  "/templates/kanban-board",
  "/templates/project-timeline",
  "/templates/project-planner",
  "/templates/daily-plan-adhd",
  "/templates/time-block",
  "/templates/eisenhower-matrix",
  "/templates/brain-dump",
  "/templates/three-priorities",
  "/templates/shutdown-checklist",
  "/templates/routine-tracker",
  "/templates/lecture-notes",
  "/templates/paper-summary",
  "/templates/reading-log",
  "/templates/book-notes",
  "/templates/revision-planner",
  "/templates/monthly-budget",
  "/templates/expense-tracker",
  "/templates/bill-tracker",
  "/templates/debt-tracker",
  "/templates/sinking-funds",
  "/templates/net-worth",
  "/templates/habit-tracker",
  "/templates/meal-planner",
  "/templates/grocery-list",
  "/templates/recipe-page",
  "/templates/daily-reflection",
  "/templates/gratitude-journal",
  "/templates/bullet-journal",
  "/templates/mood-tracker",
  "/templates/sleep-log",
  "/templates/weekly-review",
  "/templates/fitness-planner",
  "/templates/workout-log",
  "/templates/weight-loss-tracker",
  "/templates/self-care-checklist",
  "/templates/password-log",
  "/templates/cleaning-schedule",
  "/templates/travel-planner",
  "/templates/birthday-tracker",
  "/templates/vision-board",
  "/templates/savings-challenge",
  // `/templates/mcp-docs` is a public, indexable template page (its layout sets
  // a canonical and no `robots: noindex`); it was previously missing from the
  // sitemap. Included here to fix that drift.
  "/templates/mcp-docs",
];

const KIDS_PATHS = [
  "/kids/tracing",
  "/kids/math",
  "/kids/math/custom",
  // `/kids/math/[operation]` — params from generateStaticParams in
  // src/app/kids/math/[operation]/page.tsx
  "/kids/math/addition",
  "/kids/math/subtraction",
  "/kids/math/multiplication",
  "/kids/math/division",
  "/kids/number-bonds",
  "/kids/coloring",
  "/kids/connect-dots",
  "/kids/sight-words",
  // `/kids/sight-words/[grade]` — params from generateStaticParams in
  // src/app/kids/sight-words/[grade]/page.tsx
  "/kids/sight-words/kindergarten",
  "/kids/sight-words/1st-grade",
  "/kids/sight-words/2nd-grade",
  "/kids/sight-words/3rd-grade",
  "/kids/spelling",
  "/kids/cursive",
  "/kids/vocabulary",
  "/kids/patterns",
  "/kids/telling-time",
  "/kids/money-counting",
];

const GUIDE_PATHS = [
  "/guides/transfer-pdfs-to-tablet",
  "/guides/printable-worksheets-for-homeschool",
  "/guides/adhd-productivity-templates",
  "/guides/puzzle-difficulty-guide",
  "/guides/best-remarkable-planner-setup",
  "/guides/free-dated-2026-calendar-eink",
  "/guides/bullet-journaling-on-remarkable",
];

/**
 * Pack slugs — the `/packs/[slug]` routes. Currently mirrored here and in
 * `generateStaticParams` in `src/app/packs/[slug]/layout.tsx` (a server
 * component). TODO: make this the single source by importing `PACK_SLUGS`
 * into that layout's `generateStaticParams`. Until then, keep the two in sync.
 */
export const PACK_SLUGS = [
  "road-trip",
  "classroom",
  "brain-training",
  "logic-masters",
  "word-games",
] as const;

const PACK_PATHS = PACK_SLUGS.map((slug) => `/packs/${slug}`);

// ─── Sections ────────────────────────────────────────────────────────────────

export const sections: Section[] = [
  {
    id: "home",
    index: HOME_ROUTE,
    routes: [
      {
        path: "/privacy",
        changeFrequency: "yearly",
        priority: 0.3,
        label: "Privacy Policy",
      },
    ],
  },
  {
    id: "games",
    index: index("/games"),
    routes: GAME_PATHS.map(detail),
  },
  {
    id: "templates",
    index: index("/templates"),
    routes: TEMPLATE_PATHS.map(detail),
  },
  {
    id: "kids",
    index: index("/kids"),
    routes: KIDS_PATHS.map(detail),
  },
  {
    id: "guides",
    index: index("/guides"),
    routes: GUIDE_PATHS.map(guide),
  },
  {
    id: "packs",
    index: index("/packs"),
    routes: PACK_PATHS.map(detail),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sectionById(id: Section["id"]): Section {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown site-map section: ${id}`);
  return section;
}

/** All detail/sub routes for a section (excludes the section index). */
export function routesFor(id: Section["id"]): Route[] {
  return sectionById(id).routes;
}

/**
 * Resolve a human-readable label for any path — even dynamic ones not listed in
 * the source arrays (e.g. `/games/sudoku/easy`). Uses the same override +
 * title-case logic the route map is built from, so breadcrumb crumb names stay
 * consistent with sitemap/internal-linking labels.
 */
export function labelForPath(path: string): string {
  return labelFor(path);
}

export const homeRoute: Route = HOME_ROUTE;
export const gameRoutes: Route[] = routesFor("games");
export const templateRoutes: Route[] = routesFor("templates");
export const kidsRoutes: Route[] = routesFor("kids");
export const guideRoutes: Route[] = routesFor("guides");
export const packRoutes: Route[] = routesFor("packs");

/** Every section index route (e.g. `/games`, `/templates`, ...). */
export const indexRoutes: Route[] = sections
  .map((s) => s.index)
  .filter((r): r is Route => r !== null && r.path !== "/");

/** Every public route in the site, deduplicated by path. */
export const allRoutes: Route[] = (() => {
  const seen = new Set<string>();
  const out: Route[] = [];
  for (const section of sections) {
    const candidates = section.index
      ? [section.index, ...section.routes]
      : section.routes;
    for (const route of candidates) {
      if (seen.has(route.path)) continue;
      seen.add(route.path);
      out.push(route);
    }
  }
  return out;
})();
