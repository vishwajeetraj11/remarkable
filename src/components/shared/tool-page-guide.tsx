"use client";

import { usePathname } from "next/navigation";
import { TOOL_PAGE_GUIDES } from "@/lib/tool-page-guides";

export function ToolPageGuide() {
  const pathname = usePathname();
  const guide = TOOL_PAGE_GUIDES[pathname];
  if (!guide) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 pb-4" aria-labelledby="tool-guide-heading">
      <div className="border-t border-border pt-10">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Make the worksheet useful
        </p>
        <h2 id="tool-guide-heading" className="mt-2 text-xl font-semibold tracking-tight">
          Choose, check, then download
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {guide.bestFor}
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <h3 className="text-sm font-semibold">Suggested workflow</h3>
            <ol className="mt-4 space-y-4">
              {guide.workflow.map((step, index) => (
                <li key={step} className="grid grid-cols-[1.75rem_1fr] gap-3 text-sm leading-6">
                  <span className="flex size-7 items-center justify-center rounded-full border border-border text-xs font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold">Why this format</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.rationale}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Sample PDF</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.sample}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
