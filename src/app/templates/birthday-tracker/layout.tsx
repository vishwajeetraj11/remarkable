import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birthday & Event Tracker",
  description:
    "Annual tracker for birthdays, anniversaries, and important dates organized by month.",
  alternates: { canonical: "/templates/birthday-tracker" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
