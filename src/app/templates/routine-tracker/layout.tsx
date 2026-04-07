import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routine Tracker Template",
  description:
    "Weekly habit and routine tracker grid with checkboxes for morning and evening routines. Download as a free printable PDF.",
  alternates: { canonical: "/templates/routine-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
