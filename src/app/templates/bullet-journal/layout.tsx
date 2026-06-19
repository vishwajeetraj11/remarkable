import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bullet Journal Kit — Printable BuJo Collections for reMarkable",
  description:
    "A printable, hyperlinked bullet-journal kit PDF — tap the index to jump to any collection and tap back from any page. Includes a key/legend, future log, monthly log, weekly/daily log, and a trackers & collections page, all on a dot-grid. Free download for reMarkable and other e-ink tablets.",
  keywords: [
    "bullet journal",
    "bujo template",
    "printable bullet journal",
    "hyperlinked PDF",
    "future log",
    "monthly log",
    "weekly log",
    "habit tracker",
    "dot grid journal",
    "remarkable bullet journal",
  ],
  alternates: { canonical: "/templates/bullet-journal" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
