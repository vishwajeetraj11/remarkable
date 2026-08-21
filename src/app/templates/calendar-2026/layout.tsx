import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";

const calendarFaqs = [
  {
    question: "Is the 2026 calendar really dated?",
    answer:
      "Yes. Every month shows real day numbers in the correct weekday columns for 2026, and a 2027 option is available too.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes — generate and download as many calendars as you want. No account or payment required.",
  },
  {
    question: "Which devices does it fit?",
    answer:
      "It can be generated at native sizes for reMarkable 2, Paper Pro, Paper Pro Move, Supernote, BOOX, Kindle Scribe, plus A4 and US Letter for printing.",
  },
];

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
  return (
    <>
      {children}
      <FaqJsonLd faqs={calendarFaqs} />
    </>
  );
}
