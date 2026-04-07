import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Templates";
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
          Templates
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
          49+ customizable templates organized into 8 packs
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
          <span>Planners</span>
          <span>·</span>
          <span>Calendars</span>
          <span>·</span>
          <span>Meeting Notes</span>
          <span>·</span>
          <span>Habits</span>
          <span>·</span>
          <span>Journals</span>
          <span>·</span>
          <span>Budgets</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
