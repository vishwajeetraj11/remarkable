"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { labelForPath } from "@/lib/site-map";

/**
 * Reusable breadcrumb trail for detail pages.
 *
 * Renders BOTH:
 *  - a visible, accessible `<nav aria-label="Breadcrumb">` (ordered list, last
 *    item `aria-current="page"`), and
 *  - a `BreadcrumbList` JSON-LD `<script>` with absolute `item` URLs.
 *
 * Crumbs are derived from the current pathname and labelled via the
 * `site-map.ts` label source, so names stay consistent with the sitemap and
 * internal-linking UI.
 *
 * This is a Client Component only so it can read `usePathname()` — it is still
 * server-rendered into the initial HTML on first request (including the JSON-LD
 * script), which is what crawlers read.
 *
 * Index pages (a single segment, e.g. `/games`) render nothing: breadcrumbs are
 * reserved for detail pages (depth ≥ 2). Mounting this once per section layout
 * therefore covers every detail page without double-rendering.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co";

type Crumb = { name: string; href: string };

/** Build the Home › … › Page trail for a pathname (`null` if too shallow). */
function crumbsForPath(pathname: string): Crumb[] | null {
  const segments = pathname.split("/").filter(Boolean);
  // Detail pages only: `/games` (1 segment) gets no breadcrumb.
  if (segments.length < 2) return null;

  const crumbs: Crumb[] = [{ name: labelForPath("/"), href: "/" }];
  let href = "";
  for (const segment of segments) {
    href += `/${segment}`;
    crumbs.push({ name: labelForPath(href), href });
  }
  return crumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const crumbs = crumbsForPath(pathname);
  if (!crumbs) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.href === "/" ? "" : crumb.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-4 pt-6 text-sm text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    ›
                  </span>
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-foreground"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
