import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Semester Planner Template",
  description:
    "A linked semester planner with course dashboard, timetable, assignment tracker, exam tracker, and lecture notes. Download a free PDF.",
  alternates: { canonical: "/templates/semester-planner" },
  ...toolOpenGraph({
    title: "Semester Planner Template",
    description:
      "A linked semester planner with course dashboard, timetable, assignment tracker, exam tracker, and lecture notes.",
    path: "/templates/semester-planner",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
