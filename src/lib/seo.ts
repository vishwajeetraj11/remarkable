import type { Metadata } from "next";

/**
 * Shared Open Graph / Twitter metadata builder for tool pages.
 *
 * Every generator page gets two dynamically rendered social images from
 * `/api/og`:
 *   - a 1000×1500 vertical image (Pinterest pin ratio, listed first so
 *     Pinterest's Rich Pin crawler picks it up)
 *   - a 1200×630 landscape image (Twitter/Facebook cards)
 *
 * Spread the result into a page's `metadata` export after the base fields:
 *
 *   export const metadata: Metadata = {
 *     title: "...",
 *     description: "...",
 *     alternates: { canonical: "/games/maze" },
 *     ...toolOpenGraph({ title: "...", description: "...", path: "/games/maze" }),
 *   };
 */
export function toolOpenGraph({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const params = new URLSearchParams({ title, description, path });
  const pin = `/api/og?${params.toString()}&v=pin`;
  const wide = `/api/og?${params.toString()}&v=wide`;

  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Remarkable Skills",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: pin,
          width: 1000,
          height: 1500,
          alt: `${title} — free PDF for reMarkable, Supernote & BOOX`,
        },
        { url: wide, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [wide],
    },
  };
}
