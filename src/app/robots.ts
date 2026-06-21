import type { MetadataRoute } from "next";

import { SITE_URL as BASE_URL } from "@/lib/site-url";

const AI_CRAWLERS = [
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "PerplexityBot",
  "Claude-Web",
  "anthropic-ai",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    // Non-standard but picked up by some crawlers
    host: BASE_URL,
  };
}
