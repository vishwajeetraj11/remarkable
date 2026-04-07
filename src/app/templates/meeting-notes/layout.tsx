import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Notes Template",
  description:
    "Structured meeting page with attendees, agenda, discussion notes, and action items. Download as a free printable PDF.",
  alternates: { canonical: "/templates/meeting-notes" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
