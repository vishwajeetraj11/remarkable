/**
 * Vector clue-icon registry shared by SVG previews and jsPDF rendering.
 * Each icon is defined once as primitive draw ops; `toSvg` renders the
 * same ops for the web. No rasterizing anywhere.
 *
 * Keep shapes chunky: they print inside ~20pt clue cells.
 */

export type IconOp =
  | { t: "circle"; cx: number; cy: number; r: number; fill?: boolean }
  | { t: "rect"; x: number; y: number; w: number; h: number; fill?: boolean }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number }
  | { t: "triangle"; pts: [number, number][]; fill?: boolean };

export interface ClueIcon {
  id: string;
  /** Draw within a size×size box using normalized ops (coords 0..1). */
  ops: IconOp[];
}

const ICONS: ClueIcon[] = [
  {
    id: "animal",
    ops: [
      { t: "circle", cx: 0.5, cy: 0.55, r: 0.32, fill: true },
      { t: "circle", cx: 0.28, cy: 0.25, r: 0.14, fill: true },
      { t: "circle", cx: 0.72, cy: 0.25, r: 0.14, fill: true },
    ],
  },
  {
    id: "plant",
    ops: [
      { t: "rect", x: 0.46, y: 0.45, w: 0.08, h: 0.5, fill: true },
      { t: "circle", cx: 0.35, cy: 0.4, r: 0.16 },
      { t: "circle", cx: 0.65, cy: 0.4, r: 0.16 },
      { t: "circle", cx: 0.5, cy: 0.22, r: 0.18 },
    ],
  },
  {
    id: "vehicle",
    ops: [
      { t: "rect", x: 0.12, y: 0.4, w: 0.76, h: 0.3, fill: true },
      { t: "rect", x: 0.3, y: 0.2, w: 0.4, h: 0.24, fill: true },
      { t: "circle", cx: 0.28, cy: 0.78, r: 0.13, fill: true },
      { t: "circle", cx: 0.72, cy: 0.78, r: 0.13, fill: true },
    ],
  },
  {
    id: "house",
    ops: [
      { t: "triangle", pts: [[0.15, 0.5], [0.5, 0.15], [0.85, 0.5]], fill: true },
      { t: "rect", x: 0.24, y: 0.5, w: 0.52, h: 0.42, fill: true },
    ],
  },
  {
    id: "food",
    ops: [
      { t: "circle", cx: 0.5, cy: 0.62, r: 0.3 },
      { t: "line", x1: 0.2, y1: 0.4, x2: 0.8, y2: 0.4 },
      { t: "line", x1: 0.5, y1: 0.4, x2: 0.5, y2: 0.18 },
    ],
  },
  {
    id: "sport",
    ops: [{ t: "circle", cx: 0.5, cy: 0.5, r: 0.34 }, { t: "line", x1: 0.16, y1: 0.5, x2: 0.84, y2: 0.5 }],
  },
  {
    id: "music",
    ops: [
      { t: "circle", cx: 0.38, cy: 0.68, r: 0.16, fill: true },
      { t: "line", x1: 0.53, y1: 0.68, x2: 0.53, y2: 0.2 },
      { t: "rect", x: 0.53, y: 0.16, w: 0.26, h: 0.12, fill: true },
    ],
  },
  {
    id: "tool",
    ops: [
      { t: "rect", x: 0.42, y: 0.3, w: 0.16, h: 0.6, fill: true },
      { t: "rect", x: 0.3, y: 0.14, w: 0.4, h: 0.18, fill: true },
    ],
  },
  {
    id: "water",
    ops: [
      { t: "triangle", pts: [[0.5, 0.12], [0.82, 0.6], [0.18, 0.6]], fill: true },
      { t: "line", x1: 0.26, y1: 0.74, x2: 0.74, y2: 0.74 },
    ],
  },
  {
    id: "celestial",
    ops: [
      { t: "circle", cx: 0.5, cy: 0.5, r: 0.26, fill: true },
      { t: "line", x1: 0.5, y1: 0.06, x2: 0.5, y2: 0.18 },
      { t: "line", x1: 0.5, y1: 0.82, x2: 0.5, y2: 0.94 },
      { t: "line", x1: 0.06, y1: 0.5, x2: 0.18, y2: 0.5 },
      { t: "line", x1: 0.82, y1: 0.5, x2: 0.94, y2: 0.5 },
    ],
  },
];

const BY_ID = new Map(ICONS.map((i) => [i.id, i]));

export function getClueIcon(id: string): ClueIcon | undefined {
  return BY_ID.get(id);
}

export function allClueIconIds(): string[] {
  return ICONS.map((i) => i.id);
}

function esc(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}

/** Standalone SVG snippet for previews (viewBox 0 0 100 100). */
export function iconToSvg(id: string, px: number): string | null {
  const icon = BY_ID.get(id);
  if (!icon) return null;
  const s = px / 100;
  const parts: string[] = [];
  for (const op of icon.ops) {
    switch (op.t) {
      case "circle":
        parts.push(
          `<circle cx="${esc(op.cx * px)}" cy="${esc(op.cy * px)}" r="${esc(op.r * px)}" fill="${op.fill ? "#111827" : "none"}" stroke="#111827" stroke-width="4"/>`,
        );
        break;
      case "rect":
        parts.push(
          `<rect x="${esc(op.x * px)}" y="${esc(op.y * px)}" width="${esc(op.w * px)}" height="${esc(op.h * px)}" fill="${op.fill ? "#111827" : "none"}" stroke="#111827" stroke-width="4"/>`,
        );
        break;
      case "line":
        parts.push(
          `<line x1="${esc(op.x1 * px)}" y1="${esc(op.y1 * px)}" x2="${esc(op.x2 * px)}" y2="${esc(op.y2 * px)}" stroke="#111827" stroke-width="4"/>`,
        );
        break;
      case "triangle":
        parts.push(
          `<polygon points="${op.pts.map(([x, y]) => `${esc(x * px)},${esc(y * px)}`).join(" ")}" fill="${op.fill ? "#111827" : "none"}" stroke="#111827" stroke-width="4"/>`,
        );
        break;
    }
  }
  void s;
  return `<svg viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
}

/** jsPDF renderer for an icon centered in a cell at (x, y, size). */
export function drawClueIcon(
  doc: import("jspdf").jsPDF,
  id: string,
  x: number,
  y: number,
  size: number,
): void {
  const icon = BY_ID.get(id);
  if (!icon) return;
  const P = (v: number) => v * size;
  doc.setDrawColor(17, 24, 39);
  doc.setFillColor(17, 24, 39);
  doc.setLineWidth(size * 0.05);
  for (const op of icon.ops) {
    switch (op.t) {
      case "circle":
        doc.circle(x + P(op.cx), y + P(op.cy), P(op.r), op.fill ? "F" : "S");
        break;
      case "rect":
        doc.rect(x + P(op.x), y + P(op.y), P(op.w), P(op.h), op.fill ? "F" : "S");
        break;
      case "line":
        doc.line(x + P(op.x1), y + P(op.y1), x + P(op.x2), y + P(op.y2));
        break;
      case "triangle": {
        const pts = op.pts.map(([px, py]) => [x + P(px), y + P(py)] as [number, number]);
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          doc.line(a[0], a[1], b[0], b[1]);
        }
        if (op.fill) {
          // Fill via tiny inset rect is ugly; use lines+fill trick:
          const cx = pts.reduce((s2, p) => s2 + p[0], 0) / pts.length;
          const cy = pts.reduce((s2, p) => s2 + p[1], 0) / pts.length;
          for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            // fan-fill from centroid
            doc.triangle(a[0], a[1], b[0], b[1], cx, cy, "F");
          }
        }
        break;
      }
    }
  }
}
