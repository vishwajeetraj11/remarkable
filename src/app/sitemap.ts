import type { MetadataRoute } from "next";

import { allRoutes } from "@/lib/site-map";
import { SITE_URL as BASE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allRoutes.map((route) => ({
    url: route.path === "/" ? BASE_URL : `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
