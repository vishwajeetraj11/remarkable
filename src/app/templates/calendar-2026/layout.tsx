import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "2026 Calendar — Dated Monthly Calendar for reMarkable",
  description:
    "Free printable 2026 dated monthly calendar PDF with real day numbers in the correct weekday columns — one page per month, with a 2027 option. Built for reMarkable and other e-ink tablets.",
  keywords: [
    "2026 calendar template",
    "2027 calendar pdf",
    "dated monthly calendar",
    "printable 2026 calendar",
    "remarkable calendar 2026",
    "monthly calendar pdf",
  ],
  alternates: { canonical: "/templates/calendar-2026" },
  ...toolOpenGraph({
    title: "2026 Calendar — Dated Monthly Calendar for reMarkable",
    description:
      "Free printable 2026 dated monthly calendar PDF with real day numbers in the correct weekday columns — one page per month, with a 2027 option. Built for reMarkable and other e-ink tablets.",
    path: "/templates/calendar-2026",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
