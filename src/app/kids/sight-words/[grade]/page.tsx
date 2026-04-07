import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SightWordsPage from "../page";

const grades = {
  kindergarten: {
    title: "Free Printable Kindergarten Sight Words Worksheets — PDF",
    description:
      "Generate kindergarten sight words practice worksheets. Trace, write, and use Dolch sight words in sentences. Free printable PDF.",
  },
  "1st-grade": {
    title: "Free Printable 1st Grade Sight Words Worksheets — PDF",
    description:
      "Generate 1st grade sight words practice worksheets. Trace, write, and use common sight words in sentences. Free printable PDF.",
  },
  "2nd-grade": {
    title: "Free Printable 2nd Grade Sight Words Worksheets — PDF",
    description:
      "Generate 2nd grade sight words practice worksheets. Build reading fluency with trace-and-write exercises. Free printable PDF.",
  },
  "3rd-grade": {
    title: "Free Printable 3rd Grade Sight Words Worksheets — PDF",
    description:
      "Generate 3rd grade sight words practice worksheets. Strengthen vocabulary with trace-and-write exercises. Free printable PDF.",
  },
} as const;

type Grade = keyof typeof grades;

export function generateStaticParams() {
  return Object.keys(grades).map((g) => ({ grade: g }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ grade: string }>;
}): Promise<Metadata> {
  const { grade } = await params;
  const meta = grades[grade as Grade];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/kids/sight-words/${grade}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ grade: string }>;
}) {
  const { grade } = await params;
  if (!(grade in grades)) notFound();
  return <SightWordsPage />;
}
