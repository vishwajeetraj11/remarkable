/**
 * Typed localized route registry.
 *
 * Every localizable page is keyed by a logical id. English paths are the
 * canonical source of truth; localized entries map to their /{locale}
 * equivalents. Hreflang alternates are reciprocal among equivalents ONLY —
 * a page never claims alternates for pages that don't exist, and English
 * doubles as x-default.
 */
import {
  LOCALE_META,
  type SiteLocale,
} from "./config";

export interface LocalizedEntry {
  /** Unprefixed English path (canonical for the logical page). */
  en: string;
  title: string;
  localized?: Partial<Record<Exclude<SiteLocale, "en">, { path: string; title: string }>>;
}

export const LOCALIZED_ROUTES = {
  "games-hub": {
    en: "/games",
    title: "Games & Puzzles",
    localized: {
      de: { path: "/spiele", title: "Spiele & Rätsel" },
      fr: { path: "/jeux", title: "Jeux & Casses-tête" },
      es: { path: "/juegos", title: "Juegos y Pasatiempos" },
    },
  },
  "word-search": {
    en: "/games/word-search",
    title: "Word Search",
    localized: {
      de: { path: "/wortsuchraetsel", title: "Wortsuchrätsel" },
      fr: { path: "/mots-meles", title: "Mots mêlés" },
      es: { path: "/sopa-de-letras", title: "Sopa de letras" },
    },
  },
  "schwedenraetsel": {
    en: "/games/arrow-words",
    title: "Arrow Words",
    localized: {
      de: { path: "/schwedenraetsel", title: "Schwedenrätsel" },
      fr: { path: "/mots-fleches", title: "Mots fléchés" },
      es: { path: "/crucigramas", title: "Crucigramas" },
    },
  },
} satisfies Record<string, LocalizedEntry>;

export type LogicalRouteId = keyof typeof LOCALIZED_ROUTES;

/** All (path, locale, title) triples that actually exist for an id. */
export function routesFor(id: LogicalRouteId): {
  locale: SiteLocale;
  path: string;
  title: string;
}[] {
  const entry = LOCALIZED_ROUTES[id];
  const out = [
    { locale: "en" as SiteLocale, path: entry.en, title: entry.title },
  ];
  for (const [loc, locEntry] of Object.entries(entry.localized ?? {})) {
    out.push({
      locale: loc as Exclude<SiteLocale, "en">,
      path: `/${loc}${locEntry.path}`,
      title: locEntry.title,
    });
  }
  return out;
}

export interface AlternateLink {
  hrefLang: string | "x-default";
  href: string;
}

/**
 * Reciprocal alternates among existing equivalents only; English is
 * x-default. Unknown locales for a page simply contribute nothing.
 */
export function alternatesFor(
  id: LogicalRouteId,
  locale: SiteLocale,
): { canonical: string; languages: AlternateLink[] } {
  const all = routesFor(id);
  const self =
    all.find((r) => r.locale === locale) ??
    (() => {
      // Localized route requested but missing → fail loudly rather than
      // silently serving English content under a foreign URL.
      throw new Error(`No ${locale} route registered for "${id}"`);
    })();

  const languages: AlternateLink[] = [];
  for (const r of all) {
    if (r.locale === locale) continue;
    languages.push({ hrefLang: LOCALE_META[r.locale].htmlLang, href: r.path });
  }
  if (locale !== "en") {
    const en = all.find((r) => r.locale === "en")!;
    languages.push({ hrefLang: "x-default", href: en.path });
  }

  return { canonical: self.path, languages };
}
