import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co";

const gameRoutes = [
  "/games/sudoku",
  "/games/sudoku/easy",
  "/games/sudoku/medium",
  "/games/sudoku/hard",
  "/games/sudoku/evil",
  "/games/word-search",
  "/games/crossword",
  "/games/maze",
  "/games/nonogram",
  "/games/word-scramble",
  "/games/cryptogram",
  "/games/kakuro",
  "/games/kenken",
  "/games/word-ladder",
  "/games/number-fill",
  "/games/logic-puzzle",
];

const templateRoutes = [
  "/templates/yearly-roadmap",
  "/templates/quarterly-goals",
  "/templates/monthly-calendar",
  "/templates/planner",
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
  "/templates/project-timeline",
  "/templates/daily-plan-adhd",
  "/templates/time-block",
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
  "/templates/habit-tracker",
  "/templates/meal-planner",
  "/templates/grocery-list",
  "/templates/recipe-page",
  "/templates/daily-reflection",
  "/templates/gratitude-journal",
  "/templates/mood-tracker",
  "/templates/sleep-log",
  "/templates/weekly-review",
  "/templates/fitness-planner",
  "/templates/weight-loss-tracker",
  "/templates/self-care-checklist",
  "/templates/password-log",
  "/templates/cleaning-schedule",
  "/templates/travel-planner",
  "/templates/birthday-tracker",
  "/templates/vision-board",
  "/templates/savings-challenge",
];

const kidsRoutes = [
  "/kids/tracing",
  "/kids/math",
  "/kids/math/addition",
  "/kids/math/subtraction",
  "/kids/math/multiplication",
  "/kids/math/division",
  "/kids/coloring",
  "/kids/connect-dots",
  "/kids/sight-words",
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

const guideRoutes = [
  "/guides/transfer-pdfs-to-tablet",
  "/guides/printable-worksheets-for-homeschool",
  "/guides/adhd-productivity-templates",
  "/guides/puzzle-difficulty-guide",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const indexRoutes = ["/games", "/kids", "/templates", "/guides", "/pricing", "/packs"];
  const pageRoutes = [...gameRoutes, ...templateRoutes, ...kidsRoutes];

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...indexRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pageRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...guideRoutes.map((route) => ({
      url: `${BASE_URL}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
