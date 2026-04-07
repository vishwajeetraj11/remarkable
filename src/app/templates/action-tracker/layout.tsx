import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Action-Item Tracker Template",
  description:
    "Tabular action tracking with checkbox, owner, due date, and status columns. Download as a free printable PDF.",
  alternates: { canonical: "/templates/action-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
