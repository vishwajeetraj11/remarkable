import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gratitude Journal Template",
  description:
    "Morning and evening gratitude prompts with daily reflections and affirmation space. Download as a free printable PDF.",
  alternates: { canonical: "/templates/gratitude-journal" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
