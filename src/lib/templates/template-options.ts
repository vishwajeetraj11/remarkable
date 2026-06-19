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
