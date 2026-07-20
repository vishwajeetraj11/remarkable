import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Inbox Capture Template",
  description:
    "Quick-capture page with checkbox lines for jotting down ideas, tasks, and fleeting thoughts. Download as a free printable PDF.",
  alternates: { canonical: "/templates/inbox-capture" },
  ...toolOpenGraph({
    title: "Inbox Capture Template",
    description:
      "Quick-capture page with checkbox lines for jotting down ideas, tasks, and fleeting thoughts. Download as a free printable PDF.",
    path: "/templates/inbox-capture",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
