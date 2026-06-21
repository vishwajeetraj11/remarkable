import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — 2026 Calendar";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "2026 Calendar",
    subtitle:
      "Dated monthly calendar with real day numbers, one page per month — also available for 2027",
    tags: ["2026", "2027", "Dated", "Monthly", "Printable"],
  });
}
