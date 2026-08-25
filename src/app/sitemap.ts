import type { MetadataRoute } from "next";

import { allRoutes } from "@/lib/site-map";
import { SITE_URL as BASE_URL } from "@/lib/site-url";
import { routesFor, LOCALIZED_ROUTES } from "@/lib/i18n/routes";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const en = allRoutes.map((route) => ({
    url: route.path === "/" ? BASE_URL : `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Localized equivalents registered in the i18n route registry.
  const localized: MetadataRoute.Sitemap = [];
  for (const id of Object.keys(LOCALIZED_ROUTES) as (keyof typeof LOCALIZED_ROUTES)[]) {
    for (const r of routesFor(id)) {
      if (r.locale === DEFAULT_LOCALE) continue;
      localized.push({
        url: `${BASE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...en, ...localized];
}
