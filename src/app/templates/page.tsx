import { TemplatesView } from "@/components/templates/templates-view";

const packs = [
  {
    name: "All-in-One Planner",
    badge: "New",
    description: "One fully hyperlinked PDF with year overview, quarterly goals, monthly calendars, weekly pages, habit tracker, and notes. Every page has clickable section tabs.",
    templates: [
      { name: "All-in-One Planner Builder", href: "/templates/all-in-one-planner", desc: "Hyperlinked mega-planner — tap to navigate between sections" },
    ],
  },
  {
    name: "Core Planner",
    badge: "Pack 1",
    description: "Essential planning templates from yearly roadmaps to daily focus pages.",
    templates: [
      { name: "Yearly Roadmap", href: "/templates/yearly-roadmap", desc: "Full-year overview with quarterly goals" },
      { name: "Quarterly Goals", href: "/templates/quarterly-goals", desc: "Quarter focus with monthly breakdowns" },
      { name: "Monthly Calendar", href: "/templates/monthly-calendar", desc: "Traditional grid calendar" },
      { name: "Weekly Planner", href: "/templates/planner", desc: "Seven-column weekly layout" },
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
    description: "Structured templates for meetings, 1:1s, project tracking, and decisions.",
    templates: [
      { name: "Meeting Notes", href: "/templates/meeting-notes", desc: "Agenda, notes, and action items" },
      { name: "1:1 Notes", href: "/templates/one-on-one", desc: "Two-column 1:1 meeting layout" },
      { name: "Client Call Sheet", href: "/templates/client-call", desc: "Prep, talking points, follow-ups" },
      { name: "Project Brief", href: "/templates/project-brief", desc: "Objective, scope, and stakeholders" },
      { name: "Decision Log", href: "/templates/decision-log", desc: "Record decisions with rationale" },
      { name: "Action-Item Tracker", href: "/templates/action-tracker", desc: "Tabular action tracking" },
      { name: "Project Timeline", href: "/templates/project-timeline", desc: "Visual milestone timeline" },
    ],
  },
  {
    name: "Focus / ADHD-Friendly",
    badge: "Pack 3",
    description: "Low-friction templates designed for focus challenges — simple, clear, and calming.",
    templates: [
      { name: "Low-Friction Daily Plan", href: "/templates/daily-plan-adhd", desc: "Energy check + one big thing" },
      { name: "Time-Block Page", href: "/templates/time-block", desc: "Half-hour time blocking grid" },
      { name: "Brain Dump", href: "/templates/brain-dump", desc: "Dump then sort into actions" },
      { name: "3 Priorities", href: "/templates/three-priorities", desc: "Just three things to focus on" },
      { name: "Shutdown Checklist", href: "/templates/shutdown-checklist", desc: "End-of-day routine" },
      { name: "Routine Tracker", href: "/templates/routine-tracker", desc: "Weekly habit checkbox grid" },
    ],
  },
  {
    name: "Study + Reading",
    badge: "Pack 4",
    description: "Note-taking and study templates for students, researchers, and avid readers.",
    templates: [
      { name: "Cornell Notes", href: "/templates/cornell", desc: "Cue column + notes + summary" },
      { name: "Lecture Notes", href: "/templates/lecture-notes", desc: "Structured lecture page" },
      { name: "Paper Summary", href: "/templates/paper-summary", desc: "Academic paper analysis" },
      { name: "Reading Log", href: "/templates/reading-log", desc: "Track books read" },
      { name: "Book Notes", href: "/templates/book-notes", desc: "Takeaways, quotes, and chapter notes" },
      { name: "Revision Planner", href: "/templates/revision-planner", desc: "Subject schedule with checkboxes" },
    ],
  },
  {
    name: "Life Admin",
    badge: "Pack 5",
    description: "Budgets, trackers, and planners for managing everyday life.",
    templates: [
      { name: "Monthly Budget", href: "/templates/monthly-budget", desc: "Budget vs. actual spending" },
      { name: "Expense Tracker", href: "/templates/expense-tracker", desc: "Daily expense log" },
      { name: "Bill Tracker", href: "/templates/bill-tracker", desc: "Bills with paid checkbox" },
      { name: "Habit Tracker", href: "/templates/habit-tracker", desc: "31-day habit grid" },
      { name: "Meal Planner", href: "/templates/meal-planner", desc: "Weekly meals grid" },
      { name: "Grocery List", href: "/templates/grocery-list", desc: "Categorized shopping list" },
      { name: "Recipe Page", href: "/templates/recipe-page", desc: "Ingredients + instructions" },
    ],
  },
  {
    name: "Journal + Wellness",
    badge: "Pack 6",
    description: "Reflection, gratitude, mood, sleep, and weekly review templates.",
    templates: [
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
    description: "Workout planning, weight tracking, and fitness goal templates.",
    templates: [
      { name: "Fitness Planner", href: "/templates/fitness-planner", desc: "Weekly workout log with sets, reps & weight" },
      { name: "Weight Loss Tracker", href: "/templates/weight-loss-tracker", desc: "12-week progress tracker with graph" },
    ],
  },
  {
    name: "Life Planning",
    badge: "Pack 8",
    description: "Goal setting, savings, travel, and event tracking for life outside work.",
    templates: [
      { name: "Vision Board", href: "/templates/vision-board", desc: "Structured goal-setting by life area" },
      { name: "Savings Challenge", href: "/templates/savings-challenge", desc: "52-week savings tracker" },
      { name: "Travel Planner", href: "/templates/travel-planner", desc: "Itinerary, packing list & budget" },
      { name: "Birthday & Event Tracker", href: "/templates/birthday-tracker", desc: "Annual events organized by month" },
      { name: "Password Log", href: "/templates/password-log", desc: "Organized login & password tracker" },
      { name: "Cleaning Schedule", href: "/templates/cleaning-schedule", desc: "Weekly cleaning checklist by room" },
    ],
  },
];

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <TemplatesView packs={packs} />
    </div>
  );
}
