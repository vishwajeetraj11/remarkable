import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Planner Template",
  description:
    "Weekly meal grid with breakfast, lunch, dinner, and snacks columns plus a grocery notes section. Download as a free printable PDF.",
  alternates: { canonical: "/templates/meal-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
