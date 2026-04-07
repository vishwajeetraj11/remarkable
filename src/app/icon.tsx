import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "6px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          width="22"
          height="22"
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
