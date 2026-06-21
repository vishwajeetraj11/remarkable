import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Debt Payoff Tracker";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Debt Payoff Tracker",
    subtitle:
      "List debts, pick snowball or avalanche, and track payoff with a progress thermometer",
    tags: ["Snowball", "Avalanche", "Balances", "APR", "Printable"],
  });
}
