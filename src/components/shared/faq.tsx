/**
 * Reusable FAQ section (Server Component).
 *
 * Renders BOTH:
 *  - a visible, accessible FAQ using native `<details>/<summary>` (works without
 *    JS — good for e-ink / no-JS — and accessible by default), and
 *  - a `FAQPage` JSON-LD `<script>` whose `mainEntity` Questions/`acceptedAnswer`
 *    EXACTLY match the visible Q&A text. Both are driven off the same `items`
 *    array, so the structured data can never drift from what is on the page.
 *
 * Matches the existing JSON-LD pattern in `layout.tsx` and the minimal section
 * aesthetic of the site (max-w-6xl, border, muted-foreground tokens).
 */

export type FaqItem = { question: string; answer: string };

export function Faq({
  items,
  heading = "Frequently asked questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-6xl px-4 py-16 md:py-20"
      >
        <h2
          id="faq-heading"
          className="text-2xl md:text-3xl font-bold tracking-tight"
        >
          {heading}
        </h2>
        <div className="mt-8 max-w-2xl divide-y divide-border border-t border-b border-border">
          {items.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground/50 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
