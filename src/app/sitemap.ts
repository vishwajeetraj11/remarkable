import type { MetadataRoute } from "next";

import { allRoutes } from "@/lib/site-map";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allRoutes.map((route) => ({
    url: route.path === "/" ? BASE_URL : `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
