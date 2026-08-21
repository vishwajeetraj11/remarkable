import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";

const plannerFaqs = [
  {
    question: "Is the weekly planner free?",
    answer:
      "Yes. Generate and download unlimited planner PDFs — no account, no paywall.",
  },
  {
    question: "Can I add hourly time slots?",
    answer:
      "Yes. Toggle the hourly time-slot option to turn each day column into a structured schedule.",
  },
  {
    question: "Does it work on reMarkable tablets?",
    answer:
      "Yes. Choose your device before downloading and the PDF is generated at its native aspect ratio, including reMarkable 2, Paper Pro, Supernote, BOOX, and Kindle Scribe.",
  },
];

export const metadata: Metadata = {
  title: "Weekly Planner Template",
  description:
    "Seven-column weekly layout with optional hourly time slots for structured planning. Download as a free printable PDF.",
  keywords: [
    "weekly planner template",
    "printable planner pdf",
    "weekly planner pdf",
    "remarkable planner",
    "hourly planner template",
    "free planner printable",
  ],
  alternates: { canonical: "/templates/planner" },
  ...toolOpenGraph({
    title: "Weekly Planner Template",
    description:
      "Seven-column weekly layout with optional hourly time slots for structured planning. Download as a free printable PDF.",
    path: "/templates/planner",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FaqJsonLd faqs={plannerFaqs} />
    </>
  );
}
