/**
 * The public template catalog used by discovery surfaces.
 *
 * Keep this list limited to templates that have a published route. Discovery
 * components can reuse the same typed entries without maintaining a second
 * set of names, links, or descriptions.
 */
export interface TemplateCatalogItem {
  name: string;
  href: string;
  desc: string;
}

export interface TemplateCatalogPack {
  name: string;
  badge: string;
  description: string;
  templates: TemplateCatalogItem[];
}

export const TEMPLATE_PACKS = [
  {
    name: "All-in-One Planner",
    badge: "New",
    description:
      "One fully hyperlinked PDF with year overview, quarterly goals, monthly calendars, weekly pages, habit tracker, and notes. Every page has clickable section tabs.",
    templates: [
      {
        name: "All-in-One Planner Builder",
        href: "/templates/all-in-one-planner",
        desc: "Hyperlinked mega-planner — tap to navigate between sections",
      },
    ],
  },
  {
    name: "Core Planner",
    badge: "Pack 1",
    description:
      "Essential planning templates from yearly roadmaps to daily focus pages.",
    templates: [
      { name: "Yearly Roadmap", href: "/templates/yearly-roadmap", desc: "Full-year overview with quarterly goals" },
      { name: "Quarterly Goals", href: "/templates/quarterly-goals", desc: "Quarter focus with monthly breakdowns" },
      { name: "Monthly Calendar", href: "/templates/monthly-calendar", desc: "Traditional grid calendar" },
      { name: "2026 Calendar", href: "/templates/calendar-2026", desc: "Dated 2026/2027 calendar with real day numbers" },
      { name: "Weekly Planner", href: "/templates/planner", desc: "Seven-column weekly layout" },
      { name: "Weekly Dated Planner", href: "/templates/weekly-dated", desc: "Real dates — vertical rows or horizontal columns" },
      { name: "Daily Focus Page", href: "/templates/daily-focus", desc: "Top 3 priorities + schedule + tasks" },
      { name: "Inbox / Capture", href: "/templates/inbox-capture", desc: "Quick-capture GTD inbox page" },
      { name: "Lined Paper", href: "/templates/lined", desc: "Classic ruled paper" },
      { name: "Dot Grid", href: "/templates/dot-grid", desc: "Bullet journal style" },
      { name: "Grid Paper", href: "/templates/grid", desc: "Square grid for sketches & diagrams" },
    ],
  },
  {
    name: "Meetings + Projects",
    badge: "Pack 2",
    description:
      "Structured templates for meetings, 1:1s, project tracking, and decisions.",
    templates: [
      { name: "Meeting Notes", href: "/templates/meeting-notes", desc: "Agenda, notes, and action items" },
      { name: "1:1 Notes", href: "/templates/one-on-one", desc: "Two-column 1:1 meeting layout" },
      { name: "Client Call Sheet", href: "/templates/client-call", desc: "Prep, talking points, follow-ups" },
      { name: "Project Brief", href: "/templates/project-brief", desc: "Objective, scope, and stakeholders" },
      { name: "Decision Log", href: "/templates/decision-log", desc: "Record decisions with rationale" },
      { name: "Action-Item Tracker", href: "/templates/action-tracker", desc: "Tabular action tracking" },
      { name: "Kanban Board", href: "/templates/kanban-board", desc: "Visual task board with workflow columns" },
      { name: "Project Timeline", href: "/templates/project-timeline", desc: "Visual milestone timeline" },
      { name: "Project Planner", href: "/templates/project-planner", desc: "Hyperlinked planner with a tappable contents page" },
    ],
  },
  {
    name: "Meeting System",
    badge: "Bundle",
    description:
      "Run every meeting the same way: prep, capture decisions, and track follow-ups across clients and 1:1s.",
    templates: [
      { name: "Meeting Notes", href: "/templates/meeting-notes", desc: "Agenda, notes, and action items" },
      { name: "1:1 Notes", href: "/templates/one-on-one", desc: "Two-column 1:1 meeting layout" },
      { name: "Client Call Sheet", href: "/templates/client-call", desc: "Prep, talking points, follow-ups" },
      { name: "Action-Item Tracker", href: "/templates/action-tracker", desc: "Tabular action tracking" },
    ],
  },
  {
    name: "Focus / ADHD-Friendly",
    badge: "Pack 3",
    description:
      "Low-friction templates designed for focus challenges — simple, clear, and calming.",
    templates: [
      { name: "Low-Friction Daily Plan", href: "/templates/daily-plan-adhd", desc: "Energy check + one big thing" },
      { name: "Time-Block Page", href: "/templates/time-block", desc: "Half-hour time blocking grid" },
      { name: "Eisenhower Matrix", href: "/templates/eisenhower-matrix", desc: "Sort tasks by urgency and importance" },
      { name: "Brain Dump", href: "/templates/brain-dump", desc: "Dump then sort into actions" },
      { name: "3 Priorities", href: "/templates/three-priorities", desc: "Just three things to focus on" },
      { name: "Shutdown Checklist", href: "/templates/shutdown-checklist", desc: "End-of-day routine" },
      { name: "Routine Tracker", href: "/templates/routine-tracker", desc: "Weekly habit checkbox grid" },
    ],
  },
  {
    name: "Study + Reading",
    badge: "Pack 4",
    description:
      "Note-taking and study templates for students, researchers, and avid readers.",
    templates: [
      { name: "Cornell Notes", href: "/templates/cornell", desc: "Cue column + notes + summary" },
      { name: "Lecture Notes", href: "/templates/lecture-notes", desc: "Structured lecture page" },
      { name: "Paper Summary", href: "/templates/paper-summary", desc: "Academic paper analysis" },
      { name: "Semester Planner", href: "/templates/semester-planner", desc: "Linked semester dashboard, timetable, assignments & exams" },
      { name: "Literature Review Matrix", href: "/templates/literature-review-matrix", desc: "Compare sources, methods, findings, limitations & themes" },
      { name: "Reading Log", href: "/templates/reading-log", desc: "Track books read" },
      { name: "Book Notes", href: "/templates/book-notes", desc: "Takeaways, quotes, and chapter notes" },
      { name: "Revision Planner", href: "/templates/revision-planner", desc: "Subject schedule with checkboxes" },
      { name: "MCP Documentation PDF", href: "/templates/mcp-docs", desc: "Full MCP docs fetched & formatted for reMarkable" },
    ],
  },
  {
    name: "Semester Success",
    badge: "Bundle",
    description:
      "One connected study system: semester dashboard, lecture capture, Cornell review pages, and exam revision planning.",
    templates: [
      { name: "Semester Planner", href: "/templates/semester-planner", desc: "Linked semester dashboard, timetable, assignments & exams" },
      { name: "Lecture Notes", href: "/templates/lecture-notes", desc: "Structured lecture page" },
      { name: "Cornell Notes", href: "/templates/cornell", desc: "Cue column + notes + summary" },
      { name: "Revision Planner", href: "/templates/revision-planner", desc: "Subject schedule with checkboxes" },
    ],
  },
  {
    name: "Life Admin",
    badge: "Pack 5",
    description:
      "Budgets, trackers, and planners for managing everyday life.",
    templates: [
      { name: "Monthly Budget", href: "/templates/monthly-budget", desc: "Budget vs. actual spending" },
      { name: "Expense Tracker", href: "/templates/expense-tracker", desc: "Daily expense log" },
      { name: "Bill Tracker", href: "/templates/bill-tracker", desc: "Bills with paid checkbox" },
      { name: "Debt Payoff Tracker", href: "/templates/debt-tracker", desc: "Snowball/avalanche payoff tracker" },
      { name: "Sinking Funds Tracker", href: "/templates/sinking-funds", desc: "Save for future expenses by goal" },
      { name: "Net Worth Tracker", href: "/templates/net-worth", desc: "Assets, liabilities, and net worth over time" },
      { name: "Habit Tracker", href: "/templates/habit-tracker", desc: "31-day habit grid" },
      { name: "Meal Planner", href: "/templates/meal-planner", desc: "Weekly meals grid" },
      { name: "Grocery List", href: "/templates/grocery-list", desc: "Categorized shopping list" },
      { name: "Recipe Page", href: "/templates/recipe-page", desc: "Ingredients + instructions" },
    ],
  },
  {
    name: "Budget Calendar",
    badge: "Bundle",
    description:
      "A monthly money system: dated calendar for due dates, budget vs. actual, and a bill-payment checklist.",
    templates: [
      { name: "Monthly Calendar", href: "/templates/monthly-calendar", desc: "Traditional grid calendar" },
      { name: "Monthly Budget", href: "/templates/monthly-budget", desc: "Budget vs. actual spending" },
      { name: "Bill Tracker", href: "/templates/bill-tracker", desc: "Bills with paid checkbox" },
      { name: "Expense Tracker", href: "/templates/expense-tracker", desc: "Daily expense log" },
    ],
  },
  {
    name: "Journal + Wellness",
    badge: "Pack 6",
    description:
      "Reflection, gratitude, mood, sleep, and weekly review templates.",
    templates: [
      { name: "Bullet Journal Kit", href: "/templates/bullet-journal", desc: "Hyperlinked BuJo collections — key, future/monthly/weekly logs & trackers" },
      { name: "Daily Reflection", href: "/templates/daily-reflection", desc: "Guided daily journal" },
      { name: "Gratitude Journal", href: "/templates/gratitude-journal", desc: "Morning & evening gratitude" },
      { name: "Mood Tracker", href: "/templates/mood-tracker", desc: "Monthly mood grid" },
      { name: "Sleep Log", href: "/templates/sleep-log", desc: "Track sleep quality" },
      { name: "Weekly Review", href: "/templates/weekly-review", desc: "End-of-week review" },
      { name: "Self-Care Checklist", href: "/templates/self-care-checklist", desc: "Daily self-care routine tracker" },
    ],
  },
  {
    name: "Health & Fitness",
    badge: "Pack 7",
    description:
      "Workout planning, weight tracking, and fitness goal templates.",
    templates: [
      { name: "Fitness Planner", href: "/templates/fitness-planner", desc: "Weekly workout log with sets, reps & weight" },
      { name: "Workout Log", href: "/templates/workout-log", desc: "Per-session gym log: one workout per page with sets/reps/weight grid" },
      { name: "Weight Loss Tracker", href: "/templates/weight-loss-tracker", desc: "12-week progress tracker with graph" },
    ],
  },
  {
    name: "Life Planning",
    badge: "Pack 8",
    description:
      "Goal setting, savings, travel, and event tracking for life outside work.",
    templates: [
      { name: "Vision Board", href: "/templates/vision-board", desc: "Structured goal-setting by life area" },
      { name: "Goal Board", href: "/templates/goal-board", desc: "Quarterly goals with milestones & target dates" },
      { name: "Quarterly Review", href: "/templates/quarterly-review", desc: "Evidence-first quarter closeout and next priorities" },
      { name: "Monthly Reset", href: "/templates/monthly-reset", desc: "Reflection, priorities, routines, and first actions" },
      { name: "Savings Challenge", href: "/templates/savings-challenge", desc: "52-week savings tracker" },
      { name: "Travel Planner", href: "/templates/travel-planner", desc: "Itinerary, packing list & budget" },
      { name: "Birthday & Event Tracker", href: "/templates/birthday-tracker", desc: "Annual events organized by month" },
      { name: "Password Log", href: "/templates/password-log", desc: "Organized login & password tracker" },
      { name: "Cleaning Schedule", href: "/templates/cleaning-schedule", desc: "Weekly cleaning checklist by room" },
    ],
  },
] satisfies TemplateCatalogPack[];

export const TEMPLATE_CATALOG: TemplateCatalogItem[] = TEMPLATE_PACKS.flatMap(
  (pack) => pack.templates,
);

const TEMPLATE_BY_HREF = new Map(
  TEMPLATE_CATALOG.map((template) => [template.href, template]),
);

export function getTemplatesByHref(
  hrefs: readonly string[],
): TemplateCatalogItem[] {
  return hrefs
    .map((href) => TEMPLATE_BY_HREF.get(href))
    .filter((template): template is TemplateCatalogItem => Boolean(template));
}

const RELATED_TEMPLATE_GROUPS = {
  planning: [
    "/templates/calendar-2026",
    "/templates/planner",
    "/templates/monthly-reset",
    "/templates/weekly-dated",
  ],
  study: [
    "/templates/lecture-notes",
    "/templates/literature-review-matrix",
    "/templates/semester-planner",
    "/templates/cornell",
  ],
  work: [
    "/templates/meeting-notes",
    "/templates/project-planner",
    "/templates/quarterly-review",
    "/templates/decision-log",
  ],
  reflection: [
    "/templates/quarterly-review",
    "/templates/monthly-reset",
    "/templates/vision-board",
    "/templates/weekly-review",
  ],
  default: [
    "/templates/calendar-2026",
    "/templates/planner",
    "/templates/meeting-notes",
    "/templates/lecture-notes",
  ],
} as const;

type RelatedTemplateGroup = keyof typeof RELATED_TEMPLATE_GROUPS;

function relatedTemplateGroup(slug: string): RelatedTemplateGroup {
  const normalizedSlug = slug.toLowerCase();
  if (
    ["lecture", "literature", "paper", "reading", "cornell", "semester"].some(
      (term) => normalizedSlug.includes(term),
    )
  ) {
    return "study";
  }
  if (
    ["meeting", "project", "decision", "client", "action"].some((term) =>
      normalizedSlug.includes(term),
    )
  ) {
    return "work";
  }
  if (
    ["review", "reflection", "gratitude", "vision", "goal", "mood"].some((term) =>
      normalizedSlug.includes(term),
    )
  ) {
    return "reflection";
  }
  if (
    ["planner", "calendar", "monthly", "habit", "routine", "daily", "weekly"].some(
      (term) => normalizedSlug.includes(term),
    )
  ) {
    return "planning";
  }
  return "default";
}

export function getRelatedTemplateItems(
  currentSlug: string,
): TemplateCatalogItem[] {
  const group = relatedTemplateGroup(currentSlug);
  const orderedHrefs = [
    ...RELATED_TEMPLATE_GROUPS[group],
    ...RELATED_TEMPLATE_GROUPS.default,
  ];
  const uniqueHrefs = [...new Set(orderedHrefs)];
  return getTemplatesByHref(uniqueHrefs)
    .filter((template) => template.href !== currentSlug)
    .slice(0, 3);
}
