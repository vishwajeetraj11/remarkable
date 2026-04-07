import { ImageResponse } from "next/og";

export const runtime = "edge";

function IconSvg({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#171717",
        borderRadius: size * 0.2,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        width={size * 0.65}
        height={size * 0.65}
      >
        <rect x="3" y="2" width="18" height="20" rx="2" />
        <line x1="7" y1="7" x2="17" y2="7" />
        <line x1="7" y1="11" x2="17" y2="11" />
        <line x1="7" y1="15" x2="13" y2="15" />
      </svg>
    </div>
  );
}

export async function GET() {
  return new ImageResponse(<IconSvg size={192} />, {
    width: 192,
    height: 192,
  });
}
