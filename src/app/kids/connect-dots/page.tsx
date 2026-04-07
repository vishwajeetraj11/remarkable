"use client";

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZES = {
  remarkable: { w: 495.72, h: 661.68, label: "reMarkable (1404×1872)" },
  a4: { w: 595.28, h: 841.89, label: "A4" },
  letter: { w: 612, h: 792, label: "US Letter" },
};

type PageSizeKey = keyof typeof PAGE_SIZES;
type Complexity = "easy" | "medium" | "hard";
type ShapeCategory = "animals" | "objects" | "letters";

// Dot count ranges
const COMPLEXITY_DOTS: Record<Complexity, [number, number]> = {
  easy: [10, 20],
  medium: [20, 40],
  hard: [40, 60],
};

// Shape templates — normalized coords in [0,1] space
// Each shape is an array of [x, y] points in order of connection
const SHAPE_TEMPLATES: Record<ShapeCategory, Array<{ name: string; points: [number, number][] }>> = {
  animals: [
    {
      name: "Fish",
      points: [
        [0.8, 0.5],[0.75, 0.35],[0.6, 0.3],[0.45, 0.3],[0.3, 0.35],[0.2, 0.45],
        [0.2, 0.55],[0.3, 0.65],[0.45, 0.7],[0.6, 0.7],[0.75, 0.65],[0.8, 0.5],
        [0.95, 0.3],[1.0, 0.5],[0.95, 0.7],[0.8, 0.5],
      ],
    },
    {
      name: "Bird",
      points: [
        [0.5, 0.2],[0.7, 0.3],[0.85, 0.25],[0.9, 0.4],[0.75, 0.45],[0.65, 0.55],
        [0.55, 0.75],[0.5, 0.85],[0.45, 0.75],[0.35, 0.55],[0.25, 0.45],
        [0.1, 0.4],[0.15, 0.25],[0.3, 0.3],[0.5, 0.2],
      ],
    },
    {
      name: "Cat",
      points: [
        [0.4, 0.2],[0.3, 0.1],[0.25, 0.25],[0.2, 0.3],[0.2, 0.5],[0.25, 0.7],
        [0.35, 0.85],[0.5, 0.9],[0.65, 0.85],[0.75, 0.7],[0.8, 0.5],
        [0.8, 0.3],[0.75, 0.25],[0.7, 0.1],[0.6, 0.2],
        [0.5, 0.15],[0.4, 0.2],
      ],
    },
  ],
  objects: [
    {
      name: "House",
      points: [
        [0.5, 0.1],[0.9, 0.4],[0.9, 0.9],[0.1, 0.9],[0.1, 0.4],[0.5, 0.1],
        [0.1, 0.4],[0.9, 0.4],[0.5, 0.1],
        [0.38, 0.9],[0.38, 0.65],[0.62, 0.65],[0.62, 0.9],
      ],
    },
    {
      name: "Rocket",
      points: [
        [0.5, 0.05],[0.65, 0.25],[0.7, 0.5],[0.7, 0.75],[0.8, 0.9],
        [0.6, 0.8],[0.5, 0.85],[0.4, 0.8],[0.2, 0.9],
        [0.3, 0.75],[0.3, 0.5],[0.35, 0.25],[0.5, 0.05],
      ],
    },
    {
      name: "Star",
      points: [
        [0.5, 0.05],[0.61, 0.35],[0.95, 0.35],[0.68, 0.57],[0.79, 0.9],
        [0.5, 0.7],[0.21, 0.9],[0.32, 0.57],[0.05, 0.35],
        [0.39, 0.35],[0.5, 0.05],
      ],
    },
  ],
  letters: [
    {
      name: "Letter A",
      points: [
        [0.5, 0.1],[0.75, 0.9],[0.65, 0.9],[0.5, 0.55],[0.35, 0.9],
        [0.25, 0.9],[0.5, 0.1],[0.3, 0.6],[0.7, 0.6],
      ],
    },
    {
      name: "Letter B",
      points: [
        [0.2, 0.1],[0.2, 0.9],[0.55, 0.9],[0.75, 0.8],[0.75, 0.6],
        [0.55, 0.5],[0.2, 0.5],[0.55, 0.5],[0.75, 0.4],[0.75, 0.2],
        [0.55, 0.1],[0.2, 0.1],
      ],
    },
    {
      name: "Letter C",
      points: [
        [0.8, 0.15],[0.6, 0.1],[0.4, 0.1],[0.25, 0.2],[0.15, 0.35],
        [0.12, 0.5],[0.15, 0.65],[0.25, 0.8],[0.4, 0.9],
        [0.6, 0.9],[0.8, 0.85],
      ],
    },
  ],
};

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateDots(
  templatePoints: [number, number][],
  targetCount: number,
  seed: number,
  areaW: number,
  areaH: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number }[] {
  const rng = seededRng(seed);

  // Interpolate template to get targetCount points
  const pts: { x: number; y: number }[] = [];
  const n = templatePoints.length;
  const totalSegments = n - 1;

  for (let i = 0; i < targetCount; i++) {
    const t = (i / (targetCount - 1)) * totalSegments;
    const seg = Math.min(Math.floor(t), totalSegments - 1);
    const frac = t - seg;
    const [ax, ay] = templatePoints[seg];
    const [bx, by] = templatePoints[Math.min(seg + 1, n - 1)];

    // Interpolate + small jitter
    const jx = (rng() - 0.5) * 0.04;
    const jy = (rng() - 0.5) * 0.04;

    pts.push({
      x: offsetX + (ax + (bx - ax) * frac + jx) * areaW,
      y: offsetY + (ay + (by - ay) * frac + jy) * areaH,
    });
  }

  return pts;
}

export default function ConnectDotsPage() {
  const [complexity, setComplexity] = useState<Complexity>("medium");
  const [shapeCategory, setShapeCategory] = useState<ShapeCategory>("animals");
  const [pageCount, setPageCount] = useState(3);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  const [dotMin, dotMax] = COMPLEXITY_DOTS[complexity];
  const dotCount = Math.floor((dotMin + dotMax) / 2);

  const shapes = SHAPE_TEMPLATES[shapeCategory];

  // Preview dots
  const previewDots = useMemo(() => {
    const shape = shapes[0];
    return generateDots(shape.points, Math.min(dotCount, 20), 42, 200, 160, 10, 10);
  }, [shapes, dotCount]);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 40;
    const areaW = w - margin * 2;
    const areaH = h - margin * 2 - 60; // leave room for title

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      const shapeDef = shapes[page % shapes.length];
      const seed = page * 6271 + 1337;
      const rng2 = seededRng(seed);
      const count = dotMin + Math.floor(rng2() * (dotMax - dotMin + 1));

      const dots = generateDots(shapeDef.points, count, seed, areaW, areaH, margin, margin + 50);

      // Title
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Connect the Dots — ${shapeDef.name}  ·  Page ${page + 1}  ·  ${count} dots`,
        w / 2,
        margin + 16,
        { align: "center" }
      );
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(140, 140, 140);
      doc.text("Connect the numbered dots in order to reveal the picture!", w / 2, margin + 30, { align: "center" });

      // Draw dots
      dots.forEach((dot, i) => {
        // Dot circle
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(60, 60, 60);
        doc.setLineWidth(0.7);
        doc.circle(dot.x, dot.y, 6, "FD");

        // Number label
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        const label = String(i + 1);
        // Offset label to avoid overlapping the dot
        const lx = dot.x + 8;
        const ly = dot.y - 4;
        doc.text(label, lx, ly);
      });

      // Star/end markers
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      if (dots.length > 0) {
        doc.text("START", dots[0].x - 4, dots[0].y + 18, { align: "center" });
        doc.text("END", dots[dots.length - 1].x, dots[dots.length - 1].y + 18, { align: "center" });
      }
    }

    doc.save(`connect-dots-${shapeCategory}-${complexity}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Connect the Dots</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Numbered dot puzzles that reveal a picture when connected in order. Three difficulty levels.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Complexity</Label>
          <Select value={complexity} onValueChange={(v) => setComplexity(v as Complexity)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (10–20 dots)</SelectItem>
              <SelectItem value="medium">Medium (20–40 dots)</SelectItem>
              <SelectItem value="hard">Hard (40–60 dots)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Shape category</Label>
          <Select value={shapeCategory} onValueChange={(v) => setShapeCategory(v as ShapeCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="animals">Animals</SelectItem>
              <SelectItem value="objects">Objects</SelectItem>
              <SelectItem value="letters">Letters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Page count: {pageCount}</Label>
          <Slider
            min={1}
            max={10}
            value={[pageCount]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPageCount(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>10</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAGE_SIZES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview — {shapes[0].name}</h2>
        <div className="border border-border rounded-xl bg-white p-5 flex items-center gap-5">
          <svg width={220} height={180} className="border border-border/30 rounded flex-shrink-0 bg-white">
            <text x={110} y={14} textAnchor="middle" fontSize={8} fill="#aaa">Connect 1 → {Math.min(dotCount, 20)}</text>
            {previewDots.map((dot, i) => (
              <g key={i}>
                <circle cx={dot.x} cy={dot.y} r={5} fill="white" stroke="#444" strokeWidth={0.7} />
                <text x={dot.x + 7} y={dot.y - 3} fontSize={5.5} fontWeight="bold" fill="#222">
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div>Shape: <span className="font-medium">{shapes[0].name}</span></div>
            <div>Dots per page: <span className="font-medium">{dotMin}–{dotMax}</span></div>
            <div>{pageCount} page{pageCount > 1 ? "s" : ""}</div>
            <div>Numbered in order</div>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
