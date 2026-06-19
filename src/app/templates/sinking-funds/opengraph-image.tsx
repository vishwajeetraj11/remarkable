import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Sinking Funds Tracker";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Sinking Funds Tracker",
    subtitle:
      "Save for future expenses with goal amounts, monthly contributions, and per-fund progress",
    tags: ["Goals", "Monthly", "Savings", "Targets", "Printable"],
  });
}
