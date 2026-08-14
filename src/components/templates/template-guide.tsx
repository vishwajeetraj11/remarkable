import type { TemplatePageGuide } from "@/lib/templates/page-guides";

export function TemplateGuide({ guide }: { guide: TemplatePageGuide }) {
  return (
    <section className="mt-12 border-t border-border pt-10" aria-labelledby="template-guide-heading">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Using this template
        </p>
        <h2 id="template-guide-heading" className="mt-2 text-xl font-semibold tracking-tight">
          A practical workflow, not just a blank page
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {guide.bestFor}
        </p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <h3 className="text-sm font-semibold">How to use it</h3>
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
            <h3 className="text-sm font-semibold">Why the page is arranged this way</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.rationale}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Configure it deliberately</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.configuration}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">What the sample contains</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.sample}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
