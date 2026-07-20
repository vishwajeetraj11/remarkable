import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Workout Log — Printable Gym Session Tracker for reMarkable",
  description:
    "Free printable workout log PDF — one gym session per page. Record date, focus, bodyweight, a warm-up, and a sets/reps/weight grid for every exercise, plus a cardio finisher and notes. Built for reMarkable and other e-ink tablets.",
  keywords: [
    "workout log",
    "gym session tracker",
    "printable workout log pdf",
    "sets reps weight log",
    "exercise log template",
    "remarkable workout log",
    "weight training log",
  ],
  alternates: { canonical: "/templates/workout-log" },
  ...toolOpenGraph({
    title: "Workout Log — Printable Gym Session Tracker for reMarkable",
    description:
      "Free printable workout log PDF — one gym session per page. Record date, focus, bodyweight, a warm-up, and a sets/reps/weight grid for every exercise, plus a cardio finisher and notes. Built for reMarkable and other e-ink tablets.",
    path: "/templates/workout-log",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
