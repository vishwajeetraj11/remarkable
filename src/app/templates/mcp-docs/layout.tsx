import type { Metadata } from "next";

import { toolOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  title: "MCP Documentation PDF",
  description:
    "Fetch the Model Context Protocol documentation and export a reMarkable-optimized PDF for offline reading.",
  alternates: { canonical: "/templates/mcp-docs" },
  ...toolOpenGraph({
    title: "MCP Documentation PDF",
    description:
      "Fetch the Model Context Protocol documentation and export a reMarkable-optimized PDF for offline reading.",
    path: "/templates/mcp-docs",
  }),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
