// Manual registry of template route paths that render ruled writing lines via
// the shared `drawHorizontalLines` helper (see pdf-utils.ts). Only these
// templates support the optional "Line spacing" (density) control, because
// that control works by scaling the spacing passed to drawHorizontalLines.
// Templates without ruled lines are intentionally excluded — showing the
// control there would be a confusing no-op.
//
// KEEP IN SYNC: this Set must match the templates whose page.tsx calls
// drawHorizontalLines. When adding a new template, add its route path here if
// (and only if) it draws ruled lines through drawHorizontalLines. This Set is
// the single touch point for gating the control — do not edit individual
// template page.tsx files.
//
// (Custom-title gating lives separately in custom-title.ts; the two registries
// are intentionally distinct because the gating criteria differ.)
export const TEMPLATES_WITH_LINE_SPACING = new Set<string>([
  "/templates/book-notes",
  "/templates/brain-dump",
  "/templates/client-call",
  "/templates/daily-focus",
  "/templates/daily-reflection",
  "/templates/decision-log",
  "/templates/gratitude-journal",
  "/templates/inbox-capture",
  "/templates/lecture-notes",
  "/templates/meeting-notes",
  "/templates/monthly-budget",
  "/templates/mood-tracker",
  "/templates/one-on-one",
  "/templates/paper-summary",
  "/templates/project-brief",
  "/templates/project-timeline",
  "/templates/quarterly-goals",
  "/templates/recipe-page",
  "/templates/revision-planner",
  "/templates/self-care-checklist",
  "/templates/shutdown-checklist",
  "/templates/travel-planner",
  "/templates/weekly-review",
  "/templates/yearly-roadmap",
]);

// Manual registry of template route paths that support the optional "Tappable
// navigation" control (see drawPageNumber in pdf-utils.ts). A template
// qualifies only if BOTH:
//   (a) its page.tsx calls the shared drawPageNumber helper (the footer where
//       the prev/next tap targets are drawn), AND
//   (b) it is multi-page via the shell page-count slider (showPageCount is not
//       disabled), since the tappable links only do anything across pages.
// The runtime guard in drawPageNumber additionally requires total > 1, so any
// single-page render is harmless even if included — but membership here is
// derived strictly from the (a)+(b) criteria above.
//
// Derived by grepping template page.tsx files for `drawPageNumber(` and
// excluding any that set showPageCount={false} (e.g. planner, monthly-calendar,
// calendar-2026). Note: all-in-one-planner sets showPageCount={false} and never
// calls drawPageNumber, so it's already absent from the drawPageNumber callers.
//
// KEEP IN SYNC: when adding a new template, add its route path here if (and
// only if) it calls drawPageNumber AND is multi-page (page-count slider
// enabled). This Set is the single touch point for gating the control — do not
// edit individual template page.tsx files.
export const TEMPLATES_WITH_PAGE_NAV = new Set<string>([
  "/templates/action-tracker",
  "/templates/bill-tracker",
  "/templates/birthday-tracker",
  "/templates/book-notes",
  "/templates/brain-dump",
  "/templates/cleaning-schedule",
  "/templates/client-call",
  "/templates/cornell",
  "/templates/daily-focus",
  "/templates/daily-plan-adhd",
  "/templates/daily-reflection",
  "/templates/debt-tracker",
  "/templates/decision-log",
  "/templates/dot-grid",
  "/templates/eisenhower-matrix",
  "/templates/expense-tracker",
  "/templates/fitness-planner",
  "/templates/gratitude-journal",
  "/templates/grid",
  "/templates/grocery-list",
  "/templates/habit-tracker",
  "/templates/inbox-capture",
  "/templates/kanban-board",
  "/templates/lecture-notes",
  "/templates/lined",
  "/templates/meal-planner",
  "/templates/meeting-notes",
  "/templates/monthly-budget",
  "/templates/mood-tracker",
  "/templates/one-on-one",
  "/templates/paper-summary",
  "/templates/password-log",
  "/templates/project-brief",
  "/templates/project-timeline",
  "/templates/quarterly-goals",
  "/templates/reading-log",
  "/templates/recipe-page",
  "/templates/revision-planner",
  "/templates/routine-tracker",
  "/templates/savings-challenge",
  "/templates/self-care-checklist",
  "/templates/shutdown-checklist",
  "/templates/sleep-log",
  "/templates/three-priorities",
  "/templates/time-block",
  "/templates/travel-planner",
  "/templates/vision-board",
  "/templates/weekly-review",
  "/templates/weight-loss-tracker",
  "/templates/yearly-roadmap",
]);
