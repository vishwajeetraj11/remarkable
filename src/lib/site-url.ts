/**
 * Shared canonical base URL for the site.
 *
 * Resolved once from `NEXT_PUBLIC_SITE_URL` (falling back to the production
 * domain) so server metadata files (`layout.tsx`, `sitemap.ts`, `robots.ts`)
 * and the client `breadcrumbs.tsx` component all agree on a single value.
 *
 * Dependency-free and safe to import from both Server and Client Components.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co";
