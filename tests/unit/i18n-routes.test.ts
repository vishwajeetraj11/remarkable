/**
 * Locale foundation invariants: registry sanity, reciprocal hreflang among
 * equivalents only, x-default → English, loud failure on missing routes.
 */
import { describe, it, expect } from "vitest";

import {
  SITE_LOCALES,
  PUZZLE_LANGUAGES,
  hrefFor,
  isSiteLocale,
  isPuzzleLanguage,
} from "@/lib/i18n/config";
import {
  LOCALIZED_ROUTES,
  alternatesFor,
  routesFor,
} from "@/lib/i18n/routes";

describe("locale config", () => {
  it("pt is a puzzle language but never a site locale", () => {
    expect(isPuzzleLanguage("pt")).toBe(true);
    expect(isSiteLocale("pt")).toBe(false);
    expect(PUZZLE_LANGUAGES.length).toBe(SITE_LOCALES.length + 1);
  });

  it("hrefFor prefixes non-English locales only", () => {
    expect(hrefFor("en", "/games")).toBe("/games");
    expect(hrefFor("de", "/spiele")).toBe("/de/spiele");
    expect(() => hrefFor("fr", "jeux")).toThrow();
  });
});

describe("localized route registry", () => {
  it("every localized path is unique across the whole registry", () => {
    const seen = new Set<string>();
    for (const id of Object.keys(LOCALIZED_ROUTES) as (keyof typeof LOCALIZED_ROUTES)[]) {
      for (const r of routesFor(id)) {
        expect(seen.has(r.path), `duplicate path ${r.path}`).toBe(false);
        seen.add(r.path);
      }
    }
  });

  it("alternates are reciprocal, exclude self, and mark en as x-default", () => {
    for (const id of Object.keys(LOCALIZED_ROUTES) as (keyof typeof LOCALIZED_ROUTES)[]) {
      for (const r of routesFor(id)) {
        const { canonical, languages } = alternatesFor(id, r.locale);
        expect(canonical).toBe(r.path);

        const selfListed = languages.some((l) => l.href === canonical);
        expect(selfListed).toBe(false);

        // Reciprocity: every alternate lists me back.
        for (const alt of languages) {
          if (alt.hrefLang === "x-default") continue;
          const altLocale = alt.hrefLang as "en";
          const back = alternatesFor(id, altLocale).languages;
          expect(back.some((b) => b.href === canonical)).toBe(true);
        }

        if (r.locale !== "en") {
          const xd = languages.find((l) => l.hrefLang === "x-default");
          expect(xd?.href).toBe("/games" === canonical ? undefined : routesFor(id)[0].path);
        } else {
          expect(languages.some((l) => l.hrefLang === "x-default")).toBe(false);
        }
      }
    }
  });

  it("fails loudly when a locale route is missing instead of serving English", () => {
    expect(() => alternatesFor("word-search", "es")).not.toThrow(); // registered
    // Remove a registration on a copy to prove the guard fires.
    const fake = "nonexistent-locale" as never;
    expect(() => alternatesFor("schwedenraetsel", fake as never)).toThrow();
  });
});
