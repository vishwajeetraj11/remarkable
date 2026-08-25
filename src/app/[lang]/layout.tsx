import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Footer } from "@/components/shared/footer";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  isSiteLocale,
} from "@/lib/i18n/config";
import { alternatesFor, routesFor } from "@/lib/i18n/routes";

/**
 * Locale subtree layout for /de, /fr, /es.
 *
 * NOTE ON <html lang>: the unprefixed English tree keeps the single root
 * layout (app/layout.tsx, lang="en"). App Router forbids a second <html>
 * nested beneath it, so this layout sets the document language
 * synchronously before paint via a tiny inline script, while REAL
 * crawlable signals (hreflang alternates + og:locale below and in each
 * page's metadata) carry the locale for search engines.
 */

export function generateStaticParams() {
  return [{ lang: "de" }, { lang: "fr" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isSiteLocale(lang) || lang === DEFAULT_LOCALE) return {};
  const alternates = alternatesFor("games-hub", lang);
  const meta = LOCALE_META[lang];
  return {
    alternates: {
      canonical: alternates.canonical,
      languages: Object.fromEntries(
        alternates.languages.map((l) => [l.hrefLang, l.href]),
      ),
    },
    openGraph: {
      locale: meta.htmlLang,
      alternateLocale: ["en"],
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSiteLocale(lang) || lang === DEFAULT_LOCALE) notFound();
  const meta = LOCALE_META[lang];
  const hubAlternates = routesFor("games-hub");
  const setLangScript = `document.documentElement.lang=${JSON.stringify(meta.htmlLang)};`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: setLangScript }} />
      <div className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href={`/${lang}`}
            className="font-semibold tracking-tight"
            hrefLang={meta.htmlLang}
          >
            Remarkable Skills
          </Link>
          <LanguageSwitcher
            current={lang}
            targets={hubAlternates.map((r) => ({
              locale: r.locale,
              href: r.path,
            }))}
          />
        </div>
      </div>
      {children}
      <Footer />
    </>
  );
}
