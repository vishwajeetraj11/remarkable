import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox Capture Template",
  description:
    "Quick-capture page with checkbox lines for jotting down ideas, tasks, and fleeting thoughts. Download as a free printable PDF.",
  alternates: { canonical: "/templates/inbox-capture" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
