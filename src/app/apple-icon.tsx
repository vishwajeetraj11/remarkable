import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: "36px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          width="120"
          height="120"
        >
          <rect x="3" y="2" width="18" height="20" rx="2" />
          <line x1="7" y1="7" x2="17" y2="7" />
          <line x1="7" y1="11" x2="17" y2="11" />
          <line x1="7" y1="15" x2="13" y2="15" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
