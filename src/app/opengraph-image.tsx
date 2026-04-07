import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Remarkable Skills — Free Puzzles & Templates for reMarkable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#171717"
            strokeWidth="1.5"
            width="64"
            height="64"
          >
            <rect x="3" y="2" width="18" height="20" rx="2" />
            <line x1="7" y1="7" x2="17" y2="7" />
            <line x1="7" y1="11" x2="17" y2="11" />
            <line x1="7" y1="15" x2="13" y2="15" />
          </svg>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#171717",
              letterSpacing: "-0.025em",
            }}
          >
            Remarkable Skills
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "#737373",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Free puzzles, templates & activities for your reMarkable tablet
        </p>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
            fontSize: "20px",
            color: "#a3a3a3",
          }}
        >
          <span>Sudoku</span>
          <span>·</span>
          <span>Crosswords</span>
          <span>·</span>
          <span>Mazes</span>
          <span>·</span>
          <span>Planners</span>
          <span>·</span>
          <span>49+ Templates</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
