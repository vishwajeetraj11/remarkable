"use client";

import { usePathname } from "next/navigation";
import { FaqJsonLd } from "@/components/shared/faq-jsonld";
import { GAME_COPY } from "@/lib/game-copy";

/**
 * Renders descriptive, quotable copy (intro, tips, FAQ + FAQPage JSON-LD)
 * below a game generator. Generator pages are otherwise pure UI, leaving
 * crawlers and AI engines nothing to index. Unknown paths render nothing.
 */
export function GeneratorSeoCopy() {
  const pathname = usePathname();
  const copy = GAME_COPY[pathname];
  if (!copy) return null;

  return (
    <section
      className="mx-auto max-w-3xl px-4 pb-16"
      aria-labelledby={`${pathname.replace(/\//g, "-")}-about`}
    >
      <h2 id={`${pathname.replace(/\//g, "-")}-about`} className="text-xl font-semibold tracking-tight">
        About {copy.name}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{copy.intro}</p>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Tips
      </h3>
      <ul className="mt-2 space-y-1.5">
        {copy.tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
            <span aria-hidden="true" className="text-border">·</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        FAQ
      </h3>
      <dl className="mt-2 space-y-3">
        {copy.faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="text-sm font-medium">{faq.question}</dt>
            <dd className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{faq.answer}</dd>
          </div>
        ))}
      </dl>

      <FaqJsonLd faqs={copy.faqs} />
    </section>
  );
}
