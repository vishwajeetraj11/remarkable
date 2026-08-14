export type TemplateRequestStatus = "planned" | "building" | "published";

export type TemplateRoadmapItem = {
  id: string;
  title: string;
  description: string;
  audience: string;
  status: TemplateRequestStatus;
  href?: string;
};

export const roadmapStatusCopy: Record<
  TemplateRequestStatus,
  { label: string; description: string }
> = {
  planned: {
    label: "Planned",
    description: "Good ideas that have cleared review and are waiting for a build slot.",
  },
  building: {
    label: "Building",
    description: "Templates currently being designed, tested, or linked.",
  },
  published: {
    label: "Published",
    description: "Community requests that are ready to configure and download.",
  },
};

export const templateRoadmap: TemplateRoadmapItem[] = [
  {
    id: "customer-visit-log",
    title: "Customer visit log",
    description: "Repeatable visit records for contacts, objectives, observations, and follow-ups.",
    audience: "Field sales representatives and account managers.",
    status: "published",
    href: "/solutions/customer-visit-log",
  },
  {
    id: "multi-client-meeting-notebook",
    title: "Multi-client meeting notebook",
    description: "A linked notebook that keeps each client's meetings, decisions, and actions together.",
    audience: "Consultants, agencies, coaches, and independent professionals.",
    status: "published",
    href: "/solutions/multi-client-meeting-notebook",
  },
  {
    id: "book-writing-planner",
    title: "Book-writing planner",
    description: "Structure a manuscript from premise and characters through scenes and revisions.",
    audience: "Novelists, nonfiction authors, and long-form writers.",
    status: "published",
    href: "/solutions/book-writing-planner",
  },
  {
    id: "client-project-task-manager",
    title: "Client and project task manager",
    description: "Keep client context, project priorities, next actions, and delivery notes together.",
    audience: "Freelancers, consultants, and small client-service teams.",
    status: "published",
    href: "/solutions/client-project-task-manager",
  },
  {
    id: "flexible-hyperlinked-planner",
    title: "Flexible hyperlinked planner",
    description: "Choose the sections and page mix for a linked planner that follows a personal workflow.",
    audience: "People who have outgrown fixed daily and weekly planner layouts.",
    status: "published",
    href: "/solutions/flexible-hyperlinked-planner",
  },
  {
    id: "custom-planner-request",
    title: "Custom planner request brief",
    description: "Turn a rough workflow idea into a precise, device-aware template specification.",
    audience: "People requesting a specialized page or planner that does not exist yet.",
    status: "published",
    href: "/solutions/custom-planner-request",
  },
];
