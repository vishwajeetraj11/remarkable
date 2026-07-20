import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const SECTION_LABELS: Record<string, string> = {
  games: "Puzzle Generator",
  templates: "Printable Template",
  kids: "Kids Activity",
  packs: "Template Pack",
  guides: "Guide",
};

/**
 * Dynamic social image for tool pages, referenced by `toolOpenGraph()` in
 * `src/lib/seo.ts`.
 *
 * `?v=pin`  → 1000×1500 vertical (Pinterest pin ratio)
 * `?v=wide` → 1200×630 landscape (Twitter/Facebook cards)
 *
 * Visual language mirrors `section-og.tsx`: soft gradient, eyebrow, large
 * title, muted subtitle.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = (searchParams.get("title") ?? "Remarkable Skills").slice(0, 90);
  const description = (searchParams.get("description") ?? "").slice(0, 220);
  const path = searchParams.get("path") ?? "/";
  const isPin = searchParams.get("v") !== "wide";

  const section = SECTION_LABELS[path.split("/")[1]] ?? "Free Tool";
  const size = isPin
    ? { width: 1000, height: 1500 }
    : { width: 1200, height: 630 };

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(160deg, #fafafa 0%, #ececec 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: isPin ? "80px 72px" : "60px 80px",
        }}
      >
        <span
          style={{
            fontSize: isPin ? "26px" : "20px",
            color: "#a3a3a3",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: isPin ? "28px" : "16px",
          }}
        >
          {section}
        </span>
        <span
          style={{
            fontSize: isPin ? "72px" : "56px",
            fontWeight: 700,
            color: "#171717",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: isPin ? "36px" : "24px",
          }}
        >
          {title}
        </span>
        {description ? (
          <p
            style={{
              fontSize: isPin ? "32px" : "26px",
              color: "#737373",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {description}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            gap: "18px",
            marginTop: isPin ? "56px" : "40px",
            fontSize: isPin ? "24px" : "20px",
            color: "#525252",
          }}
        >
          {["Free PDF", "reMarkable", "Supernote", "BOOX"].map((tag) => (
            <span
              key={tag}
              style={{
                border: "1.5px solid #d4d4d4",
                borderRadius: "999px",
                padding: "8px 20px",
                background: "#ffffff",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          style={{
            position: "absolute",
            bottom: isPin ? "56px" : "36px",
            left: isPin ? "72px" : "80px",
            fontSize: isPin ? "24px" : "20px",
            color: "#a3a3a3",
          }}
        >
          remarkable.vishwajeet.co
        </span>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, no-transform",
      },
    }
  );
}
