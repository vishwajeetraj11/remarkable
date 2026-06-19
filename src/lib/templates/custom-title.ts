// Manual registry of template route paths whose generated PDF header is drawn
// via the shared `drawHeader` helper (see pdf-utils.ts). Membership means the
// template HAS a header bar, which gates two shared, header-only controls:
//   - "Custom title" (overrides the title passed to drawHeader), and
//   - "Start date" (prints a formatted date in the header subtitle).
// Both controls share the exact same "uses drawHeader" criterion, so they
// share this one Set. Templates that draw their header inline (not through
// drawHeader) are intentionally excluded — showing those inputs there would be
// a confusing no-op.
//
// KEEP IN SYNC: when adding a new template, add its route path here if (and
// only if) its PDF header routes through drawHeader. This Set is the single
// touch point for gating both header controls — do not edit individual
// template page.tsx files.
export const TEMPLATES_WITH_HEADER = new Set<string>([
  "/templates/action-tracker",
  "/templates/bill-tracker",
  "/templates/birthday-tracker",
  "/templates/calendar-2026",
  "/templates/cleaning-schedule",
  "/templates/client-call",
  "/templates/daily-focus",
  "/templates/debt-tracker",
  "/templates/decision-log",
  "/templates/eisenhower-matrix",
  "/templates/expense-tracker",
  "/templates/fitness-planner",
  "/templates/inbox-capture",
  "/templates/kanban-board",
  "/templates/lecture-notes",
  "/templates/meal-planner",
  "/templates/meeting-notes",
  "/templates/monthly-budget",
  "/templates/monthly-calendar",
  "/templates/net-worth",
  "/templates/one-on-one",
  "/templates/password-log",
  "/templates/project-brief",
  "/templates/project-planner",
  "/templates/project-timeline",
  "/templates/quarterly-goals",
  "/templates/reading-log",
  "/templates/revision-planner",
  "/templates/savings-challenge",
  "/templates/self-care-checklist",
  "/templates/sinking-funds",
  "/templates/sleep-log",
  "/templates/travel-planner",
  "/templates/vision-board",
  "/templates/weight-loss-tracker",
  "/templates/yearly-roadmap",
]);

// Back-compat alias: the custom-title control's gating criterion ("uses
// drawHeader") is identical to the header set above, so it is the same Set.
export const TEMPLATES_WITH_CUSTOM_TITLE = TEMPLATES_WITH_HEADER;
