// Manual registry of template route paths whose generated PDF header is drawn
// via the shared `drawHeader` helper (see pdf-utils.ts). Only these templates
// support the optional "Custom title" control, because that control works by
// overriding the title passed to drawHeader. Templates that draw their header
// inline (not through drawHeader) are intentionally excluded — showing the
// input there would be a confusing no-op.
//
// KEEP IN SYNC: when adding a new template, add its route path here if (and
// only if) its PDF header routes through drawHeader. This Set is the single
// touch point for gating the input — do not edit individual template page.tsx
// files.
export const TEMPLATES_WITH_CUSTOM_TITLE = new Set<string>([
  "/templates/action-tracker",
  "/templates/bill-tracker",
  "/templates/birthday-tracker",
  "/templates/cleaning-schedule",
  "/templates/client-call",
  "/templates/daily-focus",
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
  "/templates/one-on-one",
  "/templates/password-log",
  "/templates/project-brief",
  "/templates/project-timeline",
  "/templates/quarterly-goals",
  "/templates/reading-log",
  "/templates/revision-planner",
  "/templates/savings-challenge",
  "/templates/self-care-checklist",
  "/templates/sleep-log",
  "/templates/travel-planner",
  "/templates/vision-board",
  "/templates/weight-loss-tracker",
  "/templates/yearly-roadmap",
]);
