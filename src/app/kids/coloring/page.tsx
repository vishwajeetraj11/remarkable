"use client";

import { useState, useCallback } from "react";
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
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";
type Theme = "mandala" | "shapes" | "animals" | "nature";

// Seeded pseudo-random
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

interface DrawCtx {
  doc: InstanceType<typeof jsPDF>;
  cx: number;
  cy: number;
  seed: number;
}

function drawMandala({ doc, cx, cy, seed }: DrawCtx) {
  const rng = seededRng(seed);
  const layers = 5 + Math.floor(rng() * 3);
  const petals = 8 + Math.floor(rng() * 4) * 2; // 8, 10, 12, 14

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.8);

  // Center dot
  doc.circle(cx, cy, 4, "S");

  for (let layer = 1; layer <= layers; layer++) {
    const r = layer * 28;
    const innerR = (layer - 1) * 28;
    const style = Math.floor(rng() * 4);

    if (style === 0) {
      // Petal arcs around the ring
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        const nextAngle = ((p + 0.5) / petals) * Math.PI * 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        const mx = cx + Math.cos(nextAngle) * (r + 12);
        const my = cy + Math.sin(nextAngle) * (r + 12);
        const px2 = cx + Math.cos((p + 1) / petals * Math.PI * 2) * r;
        const py2 = cy + Math.sin((p + 1) / petals * Math.PI * 2) * r;
        // Approximate petal with lines
        doc.line(px, py, mx, my);
        doc.line(mx, my, px2, py2);
      }
    } else if (style === 1) {
      // Circle ring with dots
      doc.circle(cx, cy, r, "S");
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        const dx = cx + Math.cos(angle) * r;
        const dy = cy + Math.sin(angle) * r;
        doc.circle(dx, dy, 2.5, "S");
      }
    } else if (style === 2) {
      // Star polygon
      for (let p = 0; p < petals; p++) {
        const a1 = (p / petals) * Math.PI * 2;
        const a2 = ((p + 0.5) / petals) * Math.PI * 2;
        const ox = cx + Math.cos(a1) * r;
        const oy = cy + Math.sin(a1) * r;
        const ix = cx + Math.cos(a2) * (innerR + 8);
        const iy = cy + Math.sin(a2) * (innerR + 8);
        doc.line(cx + Math.cos((p - 0.5) / petals * Math.PI * 2) * r, cy + Math.sin((p - 0.5) / petals * Math.PI * 2) * r, ix, iy);
        doc.line(ix, iy, ox, oy);
      }
    } else {
      // Diamonds
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * Math.PI * 2;
        const topX = cx + Math.cos(a) * r;
        const topY = cy + Math.sin(a) * r;
        const botX = cx + Math.cos(a) * (innerR + 4);
        const botY = cy + Math.sin(a) * (innerR + 4);
        const la = a - Math.PI / petals;
        const ra = a + Math.PI / petals;
        const lx = cx + Math.cos(la) * (r - (r - innerR) / 2);
        const ly = cy + Math.sin(la) * (r - (r - innerR) / 2);
        const rx2 = cx + Math.cos(ra) * (r - (r - innerR) / 2);
        const ry2 = cy + Math.sin(ra) * (r - (r - innerR) / 2);
        doc.line(topX, topY, lx, ly);
        doc.line(lx, ly, botX, botY);
        doc.line(botX, botY, rx2, ry2);
        doc.line(rx2, ry2, topX, topY);
      }
    }
  }
}

function drawShapes({ doc, cx, cy, seed }: DrawCtx) {
  const rng = seededRng(seed);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.0);

  const count = 8 + Math.floor(rng() * 8);
  for (let i = 0; i < count; i++) {
    const x = cx - 160 + rng() * 320;
    const y = cy - 220 + rng() * 440;
    const size = 20 + rng() * 50;
    const shape = Math.floor(rng() * 4);

    if (shape === 0) {
      doc.rect(x - size / 2, y - size / 2, size, size, "S");
    } else if (shape === 1) {
      doc.circle(x, y, size / 2, "S");
    } else if (shape === 2) {
      // Triangle
      doc.line(x, y - size / 2, x + size / 2, y + size / 2);
      doc.line(x + size / 2, y + size / 2, x - size / 2, y + size / 2);
      doc.line(x - size / 2, y + size / 2, x, y - size / 2);
    } else {
      // Star
      const pts = 5;
      for (let p = 0; p < pts; p++) {
        const a1 = (p / pts) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((p + 0.5) / pts) * Math.PI * 2 - Math.PI / 2;
        const a3 = ((p + 1) / pts) * Math.PI * 2 - Math.PI / 2;
        doc.line(
          x + Math.cos(a1) * size / 2, y + Math.sin(a1) * size / 2,
          x + Math.cos(a2) * size / 4, y + Math.sin(a2) * size / 4
        );
        doc.line(
          x + Math.cos(a2) * size / 4, y + Math.sin(a2) * size / 4,
          x + Math.cos(a3) * size / 2, y + Math.sin(a3) * size / 2
        );
      }
    }
  }
}

function drawAnimal({ doc, cx, cy, seed }: DrawCtx) {
  const rng = seededRng(seed);
  const animalType = Math.floor(rng() * 3);
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.2);

  if (animalType === 0) {
    // Simple cat face
    const r = 80;
    doc.circle(cx, cy, r, "S"); // head
    // Ears
    doc.line(cx - r * 0.7, cy - r * 0.7, cx - r * 0.9, cy - r * 1.1);
    doc.line(cx - r * 0.9, cy - r * 1.1, cx - r * 0.4, cy - r * 0.85);
    doc.line(cx + r * 0.7, cy - r * 0.7, cx + r * 0.9, cy - r * 1.1);
    doc.line(cx + r * 0.9, cy - r * 1.1, cx + r * 0.4, cy - r * 0.85);
    // Eyes
    doc.circle(cx - r * 0.35, cy - r * 0.15, 10, "S");
    doc.circle(cx + r * 0.35, cy - r * 0.15, 10, "S");
    // Pupils
    doc.circle(cx - r * 0.35, cy - r * 0.15, 4, "S");
    doc.circle(cx + r * 0.35, cy - r * 0.15, 4, "S");
    // Nose
    doc.line(cx - 6, cy + r * 0.1, cx + 6, cy + r * 0.1);
    doc.line(cx - 6, cy + r * 0.1, cx, cy + r * 0.2);
    doc.line(cx + 6, cy + r * 0.1, cx, cy + r * 0.2);
    // Whiskers
    doc.line(cx - r * 0.6, cy + r * 0.1, cx - r * 0.15, cy + r * 0.12);
    doc.line(cx - r * 0.6, cy + r * 0.2, cx - r * 0.15, cy + r * 0.18);
    doc.line(cx + r * 0.6, cy + r * 0.1, cx + r * 0.15, cy + r * 0.12);
    doc.line(cx + r * 0.6, cy + r * 0.2, cx + r * 0.15, cy + r * 0.18);
    // Smile arc approx
    doc.line(cx - 20, cy + r * 0.3, cx, cy + r * 0.4);
    doc.line(cx, cy + r * 0.4, cx + 20, cy + r * 0.3);
  } else if (animalType === 1) {
    // Simple fish
    const bw = 100;
    const bh = 60;
    doc.ellipse(cx - 10, cy, bw, bh, "S");
    // Tail
    doc.line(cx + bw / 2 - 10, cy, cx + bw / 2 + 40, cy - 40);
    doc.line(cx + bw / 2 + 40, cy - 40, cx + bw / 2 + 40, cy + 40);
    doc.line(cx + bw / 2 + 40, cy + 40, cx + bw / 2 - 10, cy);
    // Eye
    doc.circle(cx - bw * 0.3, cy - 8, 8, "S");
    doc.circle(cx - bw * 0.3, cy - 8, 3, "S");
    // Fin
    doc.line(cx - 20, cy - bh / 2, cx, cy - bh / 2 - 20);
    doc.line(cx, cy - bh / 2 - 20, cx + 20, cy - bh / 2);
    // Scales hint
    for (let sc = 0; sc < 4; sc++) {
      doc.circle(cx - 30 + sc * 22, cy + 5, 12, "S");
    }
  } else {
    // Simple butterfly
    const w2 = 110;
    const h2 = 80;
    // Upper wings
    doc.ellipse(cx - w2 * 0.55, cy - h2 * 0.35, w2 * 0.8, h2 * 0.65, "S");
    doc.ellipse(cx + w2 * 0.55, cy - h2 * 0.35, w2 * 0.8, h2 * 0.65, "S");
    // Lower wings (smaller)
    doc.ellipse(cx - w2 * 0.45, cy + h2 * 0.35, w2 * 0.6, h2 * 0.5, "S");
    doc.ellipse(cx + w2 * 0.45, cy + h2 * 0.35, w2 * 0.6, h2 * 0.5, "S");
    // Body
    doc.ellipse(cx, cy, 8, h2 * 0.7, "S");
    // Antennae
    doc.line(cx, cy - h2 * 0.7, cx - 20, cy - h2 * 1.1);
    doc.circle(cx - 20, cy - h2 * 1.1, 4, "S");
    doc.line(cx, cy - h2 * 0.7, cx + 20, cy - h2 * 1.1);
    doc.circle(cx + 20, cy - h2 * 1.1, 4, "S");
    // Wing pattern circles
    doc.circle(cx - w2 * 0.55, cy - h2 * 0.4, 18, "S");
    doc.circle(cx + w2 * 0.55, cy - h2 * 0.4, 18, "S");
    doc.circle(cx - w2 * 0.45, cy + h2 * 0.35, 12, "S");
    doc.circle(cx + w2 * 0.45, cy + h2 * 0.35, 12, "S");
  }
}

function drawNature({ doc, cx, cy, seed }: DrawCtx) {
  const rng = seededRng(seed);
  doc.setDrawColor(40, 40, 40);

  // Sun in top corner
  const sunX = cx + 140;
  const sunY = cy - 200;
  doc.setLineWidth(0.8);
  doc.circle(sunX, sunY, 28, "S");
  for (let r = 0; r < 8; r++) {
    const a = (r / 8) * Math.PI * 2;
    doc.line(sunX + Math.cos(a) * 32, sunY + Math.sin(a) * 32, sunX + Math.cos(a) * 44, sunY + Math.sin(a) * 44);
  }

  // Ground
  doc.setLineWidth(1.2);
  doc.line(cx - 180, cy + 150, cx + 180, cy + 150);

  // Tree trunk
  doc.setLineWidth(1.5);
  doc.rect(cx - 14, cy, 28, 150, "S");

  // Tree canopy (3 triangles stacked)
  [[0, 100, 85], [0, 50, 70], [0, 10, 55]].forEach(([dx, dy, hw]) => {
    const tx = cx + dx;
    const ty = cy - dy;
    doc.line(tx, ty - hw, tx - hw, ty);
    doc.line(tx - hw, ty, tx + hw, ty);
    doc.line(tx + hw, ty, tx, ty - hw);
  });

  // Flowers
  const flowerPositions = [[-120, 145], [80, 145], [-60, 148], [140, 143]];
  flowerPositions.forEach(([fx, fy]) => {
    const x = cx + fx;
    const y = cy + fy;
    doc.setLineWidth(0.7);
    for (let p = 0; p < 6; p++) {
      const a = (p / 6) * Math.PI * 2;
      doc.circle(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 5, "S");
    }
    doc.circle(x, y, 5, "S");
    // Stem
    doc.line(x, y + 5, x + (rng() > 0.5 ? 4 : -4), y + 22);
  });

  // Clouds
  const cloudX = cx - 110;
  const cloudY = cy - 180;
  doc.setLineWidth(0.8);
  [[-20, 0, 22], [10, -12, 18], [30, 0, 20]].forEach(([dx, dy, r]) => {
    doc.circle(cloudX + dx, cloudY + dy, r, "S");
  });
}

const DRAWERS: Record<Theme, (ctx: DrawCtx) => void> = {
  mandala: drawMandala,
  shapes: drawShapes,
  animals: drawAnimal,
  nature: drawNature,
};

export default function ColoringPage() {
  const [theme, setTheme] = useState<Theme>("mandala");
  const [pageCount, setPageCount] = useState(4);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);
  const [previewSeed] = useState(() => Math.floor(Math.random() * 100000));

  const generate = useCallback(async () => {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });
    const drawer = DRAWERS[theme];
    const cx = w / 2;
    const cy = h / 2;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      // Page label
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(`${theme.charAt(0).toUpperCase() + theme.slice(1)} · Page ${page + 1}`, w / 2, 20, { align: "center" });
      doc.setTextColor(0, 0, 0);
      drawer({ doc, cx, cy, seed: (page + 1) * 7919 + previewSeed });
    }

    doc.save(`coloring-${theme}-${pageCount}p.pdf`);
    setGenerating(false);
  }, [theme, pageCount, pageSize, previewSeed]);

  // SVG preview
  const previewSize = 240;
  const svgCx = previewSize / 2;
  const svgCy = previewSize / 2;

  function mandalaSvgPaths(seed: number) {
    const rng = seededRng(seed);
    const layers = 4;
    const petals = 10;
    const paths: string[] = [];
    for (let layer = 1; layer <= layers; layer++) {
      const r = layer * 22;
      const innerR = (layer - 1) * 22;
      const style = Math.floor(rng() * 4);
      if (style === 0) {
        for (let p = 0; p < petals; p++) {
          const a1 = (p / petals) * Math.PI * 2;
          const a2 = ((p + 0.5) / petals) * Math.PI * 2;
          const a3 = ((p + 1) / petals) * Math.PI * 2;
          const px = svgCx + Math.cos(a1) * r;
          const py = svgCy + Math.sin(a1) * r;
          const mx = svgCx + Math.cos(a2) * (r + 9);
          const my = svgCy + Math.sin(a2) * (r + 9);
          const px2 = svgCx + Math.cos(a3) * r;
          const py2 = svgCy + Math.sin(a3) * r;
          paths.push(`M${px},${py} L${mx},${my} L${px2},${py2}`);
        }
      } else if (style === 1) {
        paths.push(`M${svgCx + r},${svgCy} A${r},${r} 0 1,1 ${svgCx + r - 0.01},${svgCy}`);
        for (let p = 0; p < petals; p++) {
          const a = (p / petals) * Math.PI * 2;
          const dx = svgCx + Math.cos(a) * r;
          const dy = svgCy + Math.sin(a) * r;
          paths.push(`M${dx + 2},${dy} A2,2 0 1,1 ${dx + 2 - 0.01},${dy}`);
        }
      } else {
        for (let p = 0; p < petals; p++) {
          const a1 = (p / petals) * Math.PI * 2;
          const a2 = ((p + 0.5) / petals) * Math.PI * 2;
          const ox = svgCx + Math.cos(a1) * r;
          const oy = svgCy + Math.sin(a1) * r;
          const ix = svgCx + Math.cos(a2) * (innerR + 6);
          const iy = svgCy + Math.sin(a2) * (innerR + 6);
          const a0 = ((p - 0.5) / petals) * Math.PI * 2;
          const px0 = svgCx + Math.cos(a0) * r;
          const py0 = svgCy + Math.sin(a0) * r;
          paths.push(`M${px0},${py0} L${ix},${iy} L${ox},${oy}`);
        }
      }
    }
    return paths;
  }

  const svgPaths = theme === "mandala" ? mandalaSvgPaths(previewSeed) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Coloring Pages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Procedurally generated line art — mandalas, geometric patterns, simple animals, and nature scenes.
          Fresh designs every time.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <Select value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mandala">Mandala patterns</SelectItem>
              <SelectItem value="shapes">Geometric shapes</SelectItem>
              <SelectItem value="animals">Animals</SelectItem>
              <SelectItem value="nature">Nature scenes</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl bg-white p-6 flex items-center gap-6">
          <svg width={previewSize} height={previewSize} className="border border-border/30 rounded flex-shrink-0">
            {theme === "mandala" && (
              <>
                <circle cx={svgCx} cy={svgCy} r={3} fill="none" stroke="#333" strokeWidth={1} />
                {svgPaths.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#333" strokeWidth={0.8} />
                ))}
              </>
            )}
            {theme === "shapes" && (
              <g fill="none" stroke="#333" strokeWidth={1}>
                <rect x={40} y={40} width={60} height={60} />
                <circle cx={180} cy={70} r={35} />
                <polygon points="100,160 140,220 60,220" />
                <rect x={150} y={150} width={50} height={50} />
                <circle cx={60} cy={180} r={20} />
              </g>
            )}
            {theme === "animals" && (
              <g fill="none" stroke="#333" strokeWidth={1.2}>
                <circle cx={120} cy={110} r={55} />
                <line x1={80} y1={72} x2={68} y2={40} />
                <line x1={68} y1={40} x2={96} y2={58} />
                <line x1={160} y1={72} x2={172} y2={40} />
                <line x1={172} y1={40} x2={144} y2={58} />
                <circle cx={100} cy={100} r={8} />
                <circle cx={140} cy={100} r={8} />
                <line x1={114} y1={125} x2={120} y2={135} />
                <line x1={126} y1={125} x2={120} y2={135} />
              </g>
            )}
            {theme === "nature" && (
              <g fill="none" stroke="#333">
                <circle cx={195} cy={45} r={18} strokeWidth={0.8} />
                <line x1={195} y1={25} x2={195} y2={18} strokeWidth={0.8} />
                <line x1={195} y1={65} x2={195} y2={72} strokeWidth={0.8} />
                <line x1={175} y1={45} x2={168} y2={45} strokeWidth={0.8} />
                <line x1={215} y1={45} x2={222} y2={45} strokeWidth={0.8} />
                <rect x={108} y={120} width={24} height={100} strokeWidth={1.2} />
                <polygon points="120,60 70,120 170,120" strokeWidth={1.2} />
                <polygon points="120,80 75,130 165,130" strokeWidth={1.2} />
                <line x1={20} y1={220} x2={220} y2={220} strokeWidth={1.2} />
              </g>
            )}
          </svg>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <div>Theme: <span className="font-medium capitalize">{theme}</span></div>
            <div>{pageCount} unique page{pageCount > 1 ? "s" : ""}</div>
            <div>Generated procedurally</div>
            <div>Each page different</div>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
