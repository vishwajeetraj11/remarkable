import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * Shared Open Graph / Twitter card renderer for section and detail pages.
 *
 * Matches the existing section-card visual language (games / templates / kids):
 * a centered card on a soft gradient with an eyebrow, large title, a subtitle,
 * and an optional dot-separated tag row.
 */
export function renderSectionOgImage({
  title,
  subtitle,
  tags = [],
}: {
  title: string;
  subtitle: string;
  tags?: string[];
}) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            color: "#a3a3a3",
            marginBottom: "12px",
            letterSpacing: "0.05em",
          }}
        >
          Remarkable Skills
        </span>
        <span
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#171717",
            letterSpacing: "-0.025em",
            marginBottom: "24px",
          }}
        >
          {title}
        </span>
        <p
          style={{
            fontSize: "26px",
            color: "#737373",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
        {tags.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "40px",
              fontSize: "20px",
              color: "#a3a3a3",
            }}
          >
            {tags.flatMap((tag, i) =>
              i > 0
                ? [<span key={`sep-${i}`}>·</span>, <span key={tag}>{tag}</span>]
                : [<span key={tag}>{tag}</span>]
            )}
          </div>
        ) : null}
      </div>
    ),
    { ...ogSize }
  );
}
