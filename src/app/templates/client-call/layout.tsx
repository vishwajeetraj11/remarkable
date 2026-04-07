import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Call Sheet Template",
  description:
    "Prep section, talking points, and follow-up actions for client calls. Download as a free printable PDF.",
  alternates: { canonical: "/templates/client-call" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
