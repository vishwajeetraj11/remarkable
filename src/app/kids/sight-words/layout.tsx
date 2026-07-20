import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sight Words Worksheets",
  description:
    "Practice reading and writing high-frequency sight words with tracing and writing exercises.",
  alternates: { canonical: "/kids/sight-words" },
  ...toolOpenGraph({
    title: "Sight Words Worksheets",
    description:
      "Practice reading and writing high-frequency sight words with tracing and writing exercises.",
    path: "/kids/sight-words",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
