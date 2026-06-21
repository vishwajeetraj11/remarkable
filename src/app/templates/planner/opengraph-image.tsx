import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Weekly Planner";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Weekly Planner",
    subtitle:
      "Customizable weekly planner pages designed for e-ink tablets",
    tags: ["Weekly", "Time Blocks", "Tasks", "Notes", "Printable"],
  });
}
