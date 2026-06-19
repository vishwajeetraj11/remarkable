import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Monthly Calendar";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Monthly Calendar",
    subtitle:
      "Customizable monthly calendar pages with navigation, built for e-ink tablets",
    tags: ["Monthly", "Any Year", "Navigation", "Notes", "Printable"],
  });
}
