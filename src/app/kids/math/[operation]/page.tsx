import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MathPage from "../page";

const operations = {
  addition: {
    title: "Free Printable Addition Worksheets for Kids — PDF",
    description:
      "Generate unlimited addition practice worksheets for kids. Choose difficulty from single-digit to double-digit problems. Free printable PDF with answer keys.",
  },
  subtraction: {
    title: "Free Printable Subtraction Worksheets for Kids — PDF",
    description:
      "Generate unlimited subtraction practice worksheets for kids. Choose difficulty from single-digit to double-digit problems. Free printable PDF with answer keys.",
  },
  multiplication: {
    title: "Free Printable Multiplication Worksheets for Kids — PDF",
    description:
      "Generate unlimited multiplication practice worksheets for kids. Perfect for learning times tables. Free printable PDF with answer keys.",
  },
  division: {
    title: "Free Printable Division Worksheets for Kids — PDF",
    description:
      "Generate unlimited division practice worksheets for kids. Builds strong arithmetic foundations. Free printable PDF with answer keys.",
  },
} as const;

type Operation = keyof typeof operations;

export function generateStaticParams() {
  return Object.keys(operations).map((op) => ({ operation: op }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ operation: string }>;
}): Promise<Metadata> {
  const { operation } = await params;
  const meta = operations[operation as Operation];
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/kids/math/${operation}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ operation: string }>;
}) {
  const { operation } = await params;
  if (!(operation in operations)) notFound();
  return <MathPage />;
}
