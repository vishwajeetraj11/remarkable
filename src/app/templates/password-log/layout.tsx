import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Log Template",
  description:
    "Organized password and login tracker with columns for service, username, and notes.",
  alternates: { canonical: "/templates/password-log" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
