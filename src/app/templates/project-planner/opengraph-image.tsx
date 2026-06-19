import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Project Planner";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Project Planner",
    subtitle:
      "A hyperlinked project planner — tap the index to jump to any section, tap back to return. Overview, goals, milestones, tasks, risks, and notes.",
    tags: ["Hyperlinked", "Milestones", "Tasks", "Risks", "Printable"],
  });
}
