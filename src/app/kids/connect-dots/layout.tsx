import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Connect the Dots",
  description:
    "Numbered dot-to-dot puzzles for kids. Download as PDF for reMarkable tablet.",
  alternates: { canonical: "/kids/connect-dots" },
  ...toolOpenGraph({
    title: "Connect the Dots",
    description:
      "Numbered dot-to-dot puzzles for kids. Download as PDF for reMarkable tablet.",
    path: "/kids/connect-dots",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
