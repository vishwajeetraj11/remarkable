"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

import {
  DEFAULT_LOCALE,
  LOCALE_META,
  type SiteLocale,
} from "@/lib/i18n/config";

export interface SwitcherTarget {
  locale: SiteLocale;
  href: string;
}

/**
 * Manual language switcher — no browser-language redirects, ever. Renders
 * only locales that actually have an equivalent for the current page.
 */
export function LanguageSwitcher({
  current,
  targets,
}: {
  current: SiteLocale;
  targets: SwitcherTarget[];
}) {
  if (targets.length <= 1) return null;
  return (
    <nav
      aria-label="Language"
      className="flex items-center gap-2 text-sm"
    >
      <Globe className="size-4 text-muted-foreground" aria-hidden />
      {targets.map((t) =>
        t.locale === current ? (
          <span key={t.locale} className="font-semibold" aria-current="true">
            {LOCALE_META[t.locale].label}
          </span>
        ) : (
          <Link
            key={t.locale}
            href={t.href}
            hrefLang={LOCALE_META[t.locale].htmlLang}
            className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            {LOCALE_META[t.locale].label}
          </Link>
        ),
      )}
      {current !== DEFAULT_LOCALE && (
        <span className="text-xs text-muted-foreground">
          ({LOCALE_META[DEFAULT_LOCALE].label} at unprefixed URLs)
        </span>
      )}
    </nav>
  );
}
