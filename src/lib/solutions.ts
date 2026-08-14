export const SOLUTION_SLUGS = [
  "customer-visit-log",
  "multi-client-meeting-notebook",
  "book-writing-planner",
  "client-project-task-manager",
  "flexible-hyperlinked-planner",
  "custom-planner-request",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];

export type RelatedTemplate = {
  title: string;
  description: string;
  href: string;
};

export type SolutionDefinition = {
  slug: SolutionSlug;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  promise: string;
  whoFor: string[];
  sections: string[];
  guide: { title: string; body: string }[];
  related: RelatedTemplate[];
  fileName: string;
  accent: "clay" | "moss" | "ink" | "ochre" | "slate" | "plum";
  requestForm?: boolean;
  repeatablePage?: boolean;
};

export const SOLUTIONS: Record<SolutionSlug, SolutionDefinition> = {
  "customer-visit-log": {
    slug: "customer-visit-log",
    eyebrow: "Field sales system",
    title: "Customer Visit Log for Sales Representatives",
    shortTitle: "Customer Visit Log",
    description:
      "Capture what happened in the room, what the customer needs, and what must happen next—without rebuilding your notes after every visit.",
    promise: "One repeatable page per customer visit, sized for your tablet.",
    whoFor: [
      "Field sales representatives moving between accounts",
      "Account managers who need a reliable visit history",
      "Sales leaders reviewing commitments and follow-ups",
    ],
    sections: [
      "Customer & contact details",
      "Visit objective",
      "Discovery notes",
      "Opportunities & objections",
      "Commitments",
      "Next visit & follow-up",
    ],
    guide: [
      { title: "Prepare", body: "Add the account, contact, objective, and open questions before you arrive." },
      { title: "Capture", body: "Write customer language verbatim and separate opportunities from objections." },
      { title: "Close", body: "Record owners and dates before leaving, then file the page under the account name." },
    ],
    related: [
      { title: "Client Call Sheet", description: "Prep, talking points, feedback, and follow-up actions.", href: "/templates/client-call" },
      { title: "Action Tracker", description: "Track owners, due dates, and completion across accounts.", href: "/templates/action-tracker" },
      { title: "Meeting Notes", description: "A lighter structure for general customer meetings.", href: "/templates/meeting-notes" },
    ],
    fileName: "customer-visit-log",
    accent: "clay",
    repeatablePage: true,
  },
  "multi-client-meeting-notebook": {
    slug: "multi-client-meeting-notebook",
    eyebrow: "Account-by-account notes",
    title: "Multi-Client Meeting Notebook",
    shortTitle: "Multi-Client Notebook",
    description:
      "Keep client context, meeting notes, decisions, and follow-ups together in one navigable PDF instead of scattering them across notebooks.",
    promise: "A clean client index with a repeatable meeting system behind it.",
    whoFor: [
      "Consultants and agencies managing several active clients",
      "Freelancers who need context before every call",
      "Customer-success teams maintaining account continuity",
    ],
    sections: [
      "Client index",
      "Client profile",
      "Meeting agenda",
      "Discussion notes",
      "Decisions",
      "Follow-up actions",
    ],
    guide: [
      { title: "Name the notebook", body: "Use a quarter, portfolio, or team name so the file stays easy to retrieve." },
      { title: "Duplicate by client", body: "Give every active client the same profile, notes, decision, and action sequence." },
      { title: "Review weekly", body: "Scan decisions and unfinished actions before planning the next round of meetings." },
    ],
    related: [
      { title: "One-on-One Notes", description: "A focused two-person conversation format.", href: "/templates/one-on-one" },
      { title: "Decision Log", description: "Preserve decisions and their rationale.", href: "/templates/decision-log" },
      { title: "Client Call Sheet", description: "Prepare individual calls in more detail.", href: "/templates/client-call" },
    ],
    fileName: "multi-client-meeting-notebook",
    accent: "moss",
  },
  "book-writing-planner": {
    slug: "book-writing-planner",
    eyebrow: "From premise to revision",
    title: "Book-Writing Planner",
    shortTitle: "Book-Writing Planner",
    description:
      "Turn a book idea into a visible writing system with space for the promise, structure, chapters, scenes, research, and revision work.",
    promise: "Plan the book without forcing your creative process into a rigid calendar.",
    whoFor: [
      "Novelists outlining characters, chapters, and scenes",
      "Non-fiction authors shaping an argument or reader journey",
      "Writers returning to a long project after time away",
    ],
    sections: [
      "Book vision & reader promise",
      "Character or argument map",
      "Chapter outline",
      "Scene / section tracker",
      "Research & source notes",
      "Revision plan",
    ],
    guide: [
      { title: "Define the promise", body: "Write what changes for the reader by the final page before expanding the outline." },
      { title: "Map the spine", body: "Give each chapter one job, then break only the difficult chapters into scenes or sections." },
      { title: "Separate revision", body: "Capture revision notes while drafting, but schedule them after a complete pass." },
    ],
    related: [
      { title: "Book Notes", description: "Capture ideas, quotes, and chapter takeaways.", href: "/templates/book-notes" },
      { title: "Project Planner", description: "Manage milestones, risks, and a writing backlog.", href: "/templates/project-planner" },
      { title: "Daily Focus", description: "Choose the next concrete writing session.", href: "/templates/daily-focus" },
    ],
    fileName: "book-writing-planner",
    accent: "plum",
  },
  "client-project-task-manager": {
    slug: "client-project-task-manager",
    eyebrow: "Delivery without loose ends",
    title: "Client & Project Task Manager",
    shortTitle: "Client Project Manager",
    description:
      "Keep the client brief, deliverables, backlog, weekly priorities, decisions, and risks in one project-ready PDF.",
    promise: "A practical command center for work that spans clients and projects.",
    whoFor: [
      "Freelancers balancing delivery across several engagements",
      "Small agencies that need a low-overhead project record",
      "Project leads who think more clearly on paper",
    ],
    sections: [
      "Client overview",
      "Project brief",
      "Deliverables & milestones",
      "Task backlog",
      "Weekly priorities",
      "Risks, decisions & notes",
    ],
    guide: [
      { title: "Set the boundary", body: "Write the outcome, exclusions, owner, and target date before adding tasks." },
      { title: "Work from the backlog", body: "Keep every task in one list and promote only a few items into weekly priorities." },
      { title: "Close the loop", body: "Update milestones, decisions, and risks during the same weekly review." },
    ],
    related: [
      { title: "Project Planner", description: "A full hyperlinked project workspace.", href: "/templates/project-planner" },
      { title: "Kanban Board", description: "Move tasks through a visible workflow.", href: "/templates/kanban-board" },
      { title: "Project Timeline", description: "Map milestones across a simple timeline.", href: "/templates/project-timeline" },
    ],
    fileName: "client-project-task-manager",
    accent: "slate",
  },
  "flexible-hyperlinked-planner": {
    slug: "flexible-hyperlinked-planner",
    eyebrow: "A planner that bends",
    title: "Flexible Hyperlinked Planner",
    shortTitle: "Flexible Hyperlinked Planner",
    description:
      "Build a planner around the horizons you actually use—year, quarter, month, week, habits, and notes—with tappable navigation between sections.",
    promise: "Choose the structure once; move through it quickly all year.",
    whoFor: [
      "People who want navigation without a pre-dated planner",
      "Users mixing strategic planning with weekly execution",
      "Anyone who needs notes and habits beside calendar pages",
    ],
    sections: [
      "Year overview",
      "Quarterly goals",
      "Monthly planning",
      "Weekly planning",
      "Habit tracking",
      "Notes collection",
    ],
    guide: [
      { title: "Choose horizons", body: "Include only the planning levels you review consistently." },
      { title: "Set page volume", body: "Add enough weekly and notes pages for the period, without creating a bloated file." },
      { title: "Navigate by taps", body: "Use the index and section links instead of scrolling through a long document." },
    ],
    related: [
      { title: "All-in-One Planner", description: "Build the complete hyperlinked planner.", href: "/templates/all-in-one-planner" },
      { title: "Bullet Journal Kit", description: "A flexible collection-based planning system.", href: "/templates/bullet-journal" },
      { title: "Weekly Dated Planner", description: "Start with a real week and actual dates.", href: "/templates/weekly-dated" },
    ],
    fileName: "flexible-hyperlinked-planner",
    accent: "ink",
  },
  "custom-planner-request": {
    slug: "custom-planner-request",
    eyebrow: "Describe the planner you need",
    title: "Custom Planner Request",
    shortTitle: "Custom Planner Request",
    description:
      "Turn a rough planner idea into a precise page brief, download the specification, and send the request with the details needed to evaluate it.",
    promise: "A better request produces a more useful template—and a faster answer.",
    whoFor: [
      "People whose workflow does not fit an existing template",
      "Teams standardizing a repeatable paper process",
      "Creators requesting a specialized e-ink layout",
    ],
    sections: [
      "Goal & workflow",
      "Who will use it",
      "Page map",
      "Required fields",
      "Navigation & hyperlinks",
      "Device & delivery specification",
    ],
    guide: [
      { title: "Describe the job", body: "Explain the repeated decision or record the planner should make easier." },
      { title: "List the fields", body: "Name the information you must write, check, compare, or revisit." },
      { title: "Send the brief", body: "Download the specification for your records, then open the prepared request email." },
    ],
    related: [
      { title: "All-in-One Planner", description: "Check whether the flexible builder already fits.", href: "/templates/all-in-one-planner" },
      { title: "Project Planner", description: "A robust example of linked sections.", href: "/templates/project-planner" },
      { title: "Template Library", description: "Browse every existing layout before requesting one.", href: "/templates" },
    ],
    fileName: "custom-planner-request",
    accent: "ochre",
    requestForm: true,
  },
};

export const solutionList = SOLUTION_SLUGS.map((slug) => SOLUTIONS[slug]);

export function isSolutionSlug(value: string): value is SolutionSlug {
  return SOLUTION_SLUGS.includes(value as SolutionSlug);
}
