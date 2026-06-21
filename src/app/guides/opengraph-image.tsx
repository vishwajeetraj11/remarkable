import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Guides";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Guides",
    subtitle:
      "Practical guides for e-ink tablet users — from transferring PDFs to building productive routines",
    tags: [
      "Transfer PDFs",
      "Puzzle Difficulty",
      "Productivity",
      "ADHD",
      "Homeschool",
    ],
  });
}
