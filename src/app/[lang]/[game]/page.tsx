import { notFound } from "next/navigation";

import WordSearchGenerator from "@/app/games/word-search/page";
import ArrowWordsGenerator from "@/app/games/arrow-words/page";
import {
  DEFAULT_LOCALE,
  isSiteLocale,
} from "@/lib/i18n/config";
import { LOCALIZED_ROUTES, type LogicalRouteId } from "@/lib/i18n/routes";
import type { Metadata } from "next";

/**
 * Localized puzzle pages resolve through the route registry: /de/
 * wortsuchraetsel, /fr/mots-fleches, /es/sopa-de-letras … Unknown
 * (locale, slug) pairs 404 rather than falling back to English.
 */

const GAME_COMPONENTS: Partial<
  Record<LogicalRouteId, React.ComponentType>
> = {
  "word-search": WordSearchGenerator,
  schwedenraetsel: ArrowWordsGenerator,
};

export function generateStaticParams() {
  const params: { lang: string; game: string }[] = [];
  for (const [id, entry] of Object.entries(LOCALIZED_ROUTES)) {
    if (!(id in GAME_COMPONENTS)) continue;
    for (const [loc, locEntry] of Object.entries(entry.localized ?? {})) {
      params.push({ lang: loc, game: locEntry.path.replace(/^\//, "") });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; game: string }>;
}): Promise<Metadata> {
  const { lang, game } = await params;
  const match = findRoute(lang, game);
  if (!match) return {};
  const entry = LOCALIZED_ROUTES[match.id];
  const locEntry = entry.localized?.[match.lang as "de"];
  if (!locEntry) return {};
  return {
    title: `${locEntry.title} — Remarkable Skills`,
    alternates: { canonical: `/${match.lang}${locEntry.path}` },
  };
}

function findRoute(
  lang: string,
  game: string,
): { id: LogicalRouteId; lang: string } | null {
  if (!isSiteLocale(lang) || lang === DEFAULT_LOCALE) return null;
  for (const [id, entry] of Object.entries(LOCALIZED_ROUTES) as [
    LogicalRouteId,
    (typeof LOCALIZED_ROUTES)[LogicalRouteId],
  ][]) {
    const locEntry = entry.localized?.[lang as "de"];
    if (locEntry && locEntry.path.replace(/^\//, "") === game) {
      return { id, lang };
    }
  }
  return null;
}

export default async function LocalizedGamePage({
  params,
}: {
  params: Promise<{ lang: string; game: string }>;
}) {
  const { lang, game } = await params;
  const match = findRoute(lang, game);
  if (!match) notFound();
  const Game = GAME_COMPONENTS[match.id];
  if (!Game) notFound();
  return <Game />;
}
