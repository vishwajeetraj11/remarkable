import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Number Bonds & Skip Counting — Free Printable Math Worksheets for reMarkable",
  description:
    "Generate printable number bond (part-part-whole) and skip counting worksheets with answer keys. Free PDFs for early math practice on reMarkable, e-ink tablets, A4, or US Letter.",
  keywords: [
    "number bonds worksheet",
    "skip counting worksheet",
    "part part whole",
    "number bond practice",
    "skip counting by 2 5 10",
    "printable math worksheet",
    "kindergarten math",
    "first grade math",
    "remarkable worksheets",
  ],
  alternates: { canonical: "/kids/number-bonds" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
