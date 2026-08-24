import { notFound } from "next/navigation";

import WordSearchGenerator from "@/app/games/word-search/page";
import ArrowWordsGenerator from "@/app/games/arrow-words/page";
import WordScrambleGenerator from "@/app/games/word-scramble/page";
import CryptogramGenerator from "@/app/games/cryptogram/page";
import SudokuGenerator from "@/app/games/sudoku/page";
import KakuroGenerator from "@/app/games/kakuro/page";
import NonogramGenerator from "@/app/games/nonogram/page";
import CrosswordGenerator from "@/app/games/crossword/page";
import SchwedenraetselGenerator from "@/components/games/schwedenraetsel-generator";
import {
  DEFAULT_LOCALE,
  isSiteLocale,
  type SiteLocale,
} from "@/lib/i18n/config";
import {
  LOCALIZED_ROUTES,
  localizedFor,
  type LogicalRouteId,
} from "@/lib/i18n/routes";
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
  buchstabensalat: WordScrambleGenerator,
  kryptogramm: CryptogramGenerator,
  "sudoku-de": SudokuGenerator,
  "kakuro-de": KakuroGenerator,
  nonogramm: NonogramGenerator,
  "mots-croises": CrosswordGenerator,
  crucigramas: CrosswordGenerator,
};

/** Static (locale,id) → component map; DE gets icon-based Schwedenrätsel. */
const GAME_COMPONENTS_BY_LANG: Record<string, React.ComponentType> = (() => {
  const map: Record<string, React.ComponentType> = {};
  for (const [id, entry] of Object.entries(LOCALIZED_ROUTES) as [
    LogicalRouteId,
    (typeof LOCALIZED_ROUTES)[LogicalRouteId],
  ][]) {
    const comp = GAME_COMPONENTS[id];
    if (!comp) continue;
    for (const loc of Object.keys(entry.localized ?? {})) {
      map[`${loc}:${id}`] =
        id === "schwedenraetsel" && loc === "de"
          ? SchwedenraetselGenerator
          : comp;
    }
  }
  return map;
})();

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
  const locEntry = localizedFor(match.id, match.lang);
  if (!locEntry) return {};
  return {
    title: `${locEntry.title} — Remarkable Skills`,
    alternates: { canonical: `/${match.lang}${locEntry.path}` },
  };
}

function findRoute(
  lang: string,
  game: string,
): { id: LogicalRouteId; lang: SiteLocale } | null {
  if (!isSiteLocale(lang) || lang === DEFAULT_LOCALE) return null;
  for (const id of Object.keys(LOCALIZED_ROUTES) as LogicalRouteId[]) {
    const locEntry = localizedFor(id, lang);
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
  const Game = GAME_COMPONENTS_BY_LANG[`${match.lang}:${match.id}`];
  if (!Game) notFound();
  return <Game />;
}
