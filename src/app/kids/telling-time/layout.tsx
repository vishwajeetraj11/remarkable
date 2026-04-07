import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Telling Time Worksheets",
  description:
    "Practice reading analog clocks with exercises for hours, half hours, and minutes.",
  alternates: { canonical: "/kids/telling-time" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
