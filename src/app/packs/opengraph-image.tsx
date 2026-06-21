import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Puzzle Packs";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Puzzle Packs",
    subtitle:
      "Themed bundles combining multiple puzzle types in one ready-to-print PDF",
    tags: [
      "Road Trip",
      "Classroom",
      "Brain Training",
      "Travel",
      "Family",
    ],
  });
}
