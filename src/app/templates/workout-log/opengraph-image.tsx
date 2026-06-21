import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Workout Log";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Workout Log",
    subtitle:
      "One gym session per page — log sets, reps, and weight with a warm-up and notes",
    tags: ["Sets × Reps", "Weight", "Per-session", "Cardio", "Printable"],
  });
}
