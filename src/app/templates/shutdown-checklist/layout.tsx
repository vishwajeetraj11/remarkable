import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shutdown Checklist Template",
  description:
    "End-of-day routine checklist with pre-printed items to close out your workday. Download as a free printable PDF.",
  alternates: { canonical: "/templates/shutdown-checklist" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
