import type { Metadata } from "next";
import { TemplateRequestBoard } from "@/components/requests/template-request-board";

export const metadata: Metadata = {
  title: "Request a Template — Public Template Roadmap",
  description:
    "Request a free e-ink template, vote for useful ideas, and follow templates from planned to building to published.",
  alternates: { canonical: "/requests" },
};

export default function TemplateRequestsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <header className="grid gap-8 border-b border-border pb-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Public template roadmap
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            What should exist next?
          </h1>
        </div>
        <p className="max-w-xl text-base leading-7 text-muted-foreground lg:pb-1">
          Add the page your workflow is missing, support requests already here,
          and watch useful ideas move from a community problem to a working PDF.
        </p>
      </header>

      <div className="mt-12 sm:mt-16">
        <TemplateRequestBoard />
      </div>
    </main>
  );
}
