import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Bullet Journal Kit";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Bullet Journal Kit",
    subtitle:
      "A hyperlinked BuJo collection pack — tap the index to jump to any collection, tap back to return. Key/legend, future log, monthly & weekly logs, and trackers.",
    tags: ["Hyperlinked", "Future Log", "Monthly", "Weekly", "Dot Grid"],
  });
}
