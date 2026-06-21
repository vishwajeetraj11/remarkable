import {
  ogContentType,
  ogSize,
  renderSectionOgImage,
} from "@/components/og/section-og";

export const runtime = "edge";

export const alt = "Remarkable Skills — Sudoku";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSectionOgImage({
    title: "Sudoku",
    subtitle:
      "Procedurally generated Sudoku puzzles with answer keys, optimized for e-ink",
    tags: ["Easy", "Medium", "Hard", "Expert", "Answer Keys"],
  });
}
