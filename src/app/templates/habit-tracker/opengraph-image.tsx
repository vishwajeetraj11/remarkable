import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Habit Tracker";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Habit Tracker",
    subtitle:
      "Customizable habit tracker pages to build routines on your e-ink tablet",
    tags: ["Daily", "Weekly", "Monthly", "Streaks", "Printable"],
  });
}
