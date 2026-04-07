import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spelling Practice Sheets",
  description:
    "Structured spelling practice with letter boxes and writing lines for various difficulty levels.",
  alternates: { canonical: "/kids/spelling" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
