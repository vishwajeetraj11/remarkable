import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Net Worth Tracker";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Net Worth Tracker",
    subtitle:
      "List assets and liabilities, compute net worth, and track the running total month by month",
    tags: ["Assets", "Liabilities", "Net Worth", "Monthly", "Printable"],
  });
}
