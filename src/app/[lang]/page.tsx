import Link from "next/link";
import { notFound } from "next/navigation";

import {
  DEFAULT_LOCALE,
  LOCALE_META,
  isSiteLocale,
} from "@/lib/i18n/config";
import { routesFor } from "@/lib/i18n/routes";

const HUB_COPY: Record<
  Exclude<import("@/lib/i18n/config").SiteLocale, "en">,
  { h1: string; sub: string; cta: string }
> = {
  de: {
    h1: "Spiele & Rätsel",
    sub: "Kostenlose Rätsel zum Ausdrucken — optimiert für reMarkable, Supernote, BOOX und Drucker.",
    cta: "Jetzt rätseln",
  },
  fr: {
    h1: "Jeux & Casses-tête",
    sub: "Puzzles imprimables gratuits — optimisés pour reMarkable, Supernote, BOOX et l'impression.",
    cta: "Commencer",
  },
  es: {
    h1: "Juegos y Pasatiempos",
    sub: "Pasatiempos imprimibles gratis — optimizados para reMarkable, Supernote, BOOX e impresoras.",
    cta: "Empezar",
  },
};

export default async function LocaleHubPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSiteLocale(lang) || lang === DEFAULT_LOCALE) notFound();
  const copy = HUB_COPY[lang as Exclude<typeof lang, "en">];
  const wordSearch = routesFor("word-search").find((r) => r.locale === lang)!;
  const arrowWords = routesFor("schwedenraetsel").find(
    (r) => r.locale === lang,
  )!;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{copy.h1}</h1>
      <p className="mt-3 text-muted-foreground">{copy.sub}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {[wordSearch, arrowWords].map((r) => (
          <li key={r.path}>
            <Link
              href={r.path}
              hrefLang={LOCALE_META[lang].htmlLang}
              className="block rounded-lg border p-5 transition-colors hover:bg-accent/40"
            >
              <span className="font-medium">{r.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {copy.cta} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-muted-foreground">
        {LOCALE_META[lang].label} preview — more puzzles land as banks are
        validated.
      </p>
    </div>
  );
}
