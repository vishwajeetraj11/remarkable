import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Kids Activities";
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
          Kids Activities
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
          Educational worksheets and activities for ages 3–12
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
          <span>Tracing</span>
          <span>·</span>
          <span>Math</span>
          <span>·</span>
          <span>Coloring</span>
          <span>·</span>
          <span>Sight Words</span>
          <span>·</span>
          <span>Spelling</span>
          <span>·</span>
          <span>Telling Time</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
