import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Planner Template",
  description:
    "Trip planning template with packing checklist, daily itinerary, and budget tracking.",
  alternates: { canonical: "/templates/travel-planner" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
