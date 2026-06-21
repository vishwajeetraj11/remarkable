"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { labelForPath, routesFor, type Section } from "@/lib/site-map";

/**
 * "Related" block for detail pages under `/games/*`, `/templates/*`, `/kids/*`.
 *
 * Surfaces 3–5 sibling detail pages in the same section to improve crawl depth,
 * internal PageRank distribution, and dwell time. Links are derived from
 * `site-map.ts` (no hardcoded route lists) and labelled via `labelForPath`, so
 * names stay consistent with breadcrumbs and the sitemap.
 *
 * Like {@link Breadcrumbs}, this is a Client Component only so it can read
 * `usePathname()`; it still server-renders into the initial HTML (which is what
 * crawlers read). Selection is fully deterministic from the pathname — the next
 * N siblings cyclically from the current page — so it is stable per request with
 * no hydration mismatch (no `Math.random`, no per-render shuffle).
 *
 * Renders nothing on index pages, on dynamic sub-routes, and on sections it
 * doesn't apply to (only games/templates/kids).
 */

/** Sections that get a Related block, plus their heading copy. */
const SECTION_CONFIG: Partial<Record<Section["id"], { heading: string }>> = {
  games: { heading: "More games" },
  templates: { heading: "Related templates" },
  kids: { heading: "More activities" },
};

/** Number of sibling links to show (within the 3–5 target). */
const LINK_COUNT = 4;

/** A path is a top-level detail sibling when it has exactly 2 segments. */
function isTopLevelDetail(path: string): boolean {
  return path.split("/").filter(Boolean).length === 2;
}

type Related = { heading: string; links: string[] };

/** Build the heading + sibling links for a pathname (`null` if not applicable). */
function relatedForPath(pathname: string): Related | null {
  const segments = pathname.split("/").filter(Boolean);
  // Detail pages only (depth ≥ 2); index pages (e.g. `/games`) get nothing.
  if (segments.length < 2) return null;

  const sectionId = segments[0] as Section["id"];
  const config = SECTION_CONFIG[sectionId];
  if (!config) return null;

  // Only show on top-level detail pages; skip dynamic sub-routes like
  // `/games/sudoku/easy` so the block stays on canonical detail pages.
  if (segments.length > 2) return null;

  const path = `/${segments.join("/")}`;
  const siblings = routesFor(sectionId)
    .map((route) => route.path)
    .filter(isTopLevelDetail);

  // Deterministic selection: start just after the current page and take the
  // next LINK_COUNT siblings cyclically. Stable per page → no hydration drift.
  const currentIndex = siblings.indexOf(path);
  if (currentIndex === -1) return null;

  const links: string[] = [];
  for (let i = 1; i <= siblings.length - 1 && links.length < LINK_COUNT; i += 1) {
    links.push(siblings[(currentIndex + i) % siblings.length]);
  }
  if (links.length < 3) return null;

  return { heading: config.heading, links };
}

export function RelatedLinks() {
  const pathname = usePathname();
  const related = relatedForPath(pathname);
  if (!related) return null;

  return (
    <nav
      aria-label={related.heading}
      className="mx-auto max-w-6xl px-4 pt-10 pb-16"
    >
      <div className="border-t border-border pt-8">
        <h2 className="text-sm font-medium text-foreground">
          {related.heading}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {related.links.map((href) => (
            <li key={href}>
              <Link
                href={href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {labelForPath(href)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
