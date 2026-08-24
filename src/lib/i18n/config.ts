/**
 * Locale configuration for the multilingual site.
 *
 * - English lives at unprefixed routes and is the x-default.
 * - de/fr/es live under /{locale} route groups (see app/[lang]).
 * - Portuguese is a PUZZLE language only: generators can emit pt word
 *   banks, but there is deliberately no /pt site route.
 */

export const SITE_LOCALES = ["en", "de", "fr", "es"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];

/** Languages generators can produce output in (superset of site locales). */
export const PUZZLE_LANGUAGES = [...SITE_LOCALES, "pt"] as const;
export type PuzzleLanguage = (typeof PUZZLE_LANGUAGES)[number];

export const DEFAULT_LOCALE: SiteLocale = "en";

export interface LocaleMeta {
  code: SiteLocale;
  /** BCP 47 tag for <html lang> and hreflang. */
  htmlLang: string;
  label: string;
}

export const LOCALE_META: Record<SiteLocale, LocaleMeta> = {
  en: { code: "en", htmlLang: "en", label: "English" },
  de: { code: "de", htmlLang: "de", label: "Deutsch" },
  fr: { code: "fr", htmlLang: "fr", label: "Français" },
  es: { code: "es", htmlLang: "es", label: "Español" },
};

export function isSiteLocale(value: string): value is SiteLocale {
  return (SITE_LOCALES as readonly string[]).includes(value);
}

export function isPuzzleLanguage(value: string): value is PuzzleLanguage {
  return (PUZZLE_LANGUAGES as readonly string[]).includes(value);
}

/** Unprefixed path for English, /{locale}-prefixed for everyone else. */
export function hrefFor(locale: SiteLocale, path: string): string {
  if (!path.startsWith("/")) throw new Error(`path must start with '/': ${path}`);
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}
