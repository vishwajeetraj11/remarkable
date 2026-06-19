import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Weekly Dated Planner";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Weekly Dated Planner",
    subtitle:
      "Pick any week — vertical rows or horizontal columns, with real dates",
    tags: ["Dated", "Vertical", "Horizontal", "Weekly", "Printable"],
  });
}
