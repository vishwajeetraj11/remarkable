import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Games & Puzzles";
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
          Games &amp; Puzzles
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
          12 procedurally generated puzzles with answer keys
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
          <span>Word Search</span>
          <span>·</span>
          <span>Nonograms</span>
          <span>·</span>
          <span>KenKen</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
