import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habit Tracker Template",
  description:
    "Monthly grid with 31 day columns and habit rows for consistent streak tracking. Download as a free printable PDF.",
  alternates: { canonical: "/templates/habit-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
