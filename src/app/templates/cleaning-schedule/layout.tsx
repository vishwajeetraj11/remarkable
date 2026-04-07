import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Schedule Template",
  description:
    "Weekly cleaning checklist organized by room with daily checkboxes.",
  alternates: { canonical: "/templates/cleaning-schedule" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
