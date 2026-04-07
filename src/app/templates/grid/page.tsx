"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createDoc, drawPageNumber, MM_TO_PT } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

export default function GridPage() {
  const [spacingMm, setSpacingMm] = useState(5);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const margin = 28;
    const spacingPt = spacingMm * MM_TO_PT;
    const [r, g, b] = COLORS.lineLight;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);

      const startX = margin + (((w - margin * 2) % spacingPt) / 2);
      const startY = margin + (((h - margin * 2) % spacingPt) / 2);

      // Horizontal lines
      for (let y = startY; y <= h - margin; y += spacingPt) {
        doc.line(margin, y, w - margin, y);
      }
      // Vertical lines
      for (let x = startX; x <= w - margin; x += spacingPt) {
        doc.line(x, margin, x, h - margin);
      }

      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`grid-${spacingMm}mm-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Grid Paper"
      description="Square grid paper with adjustable spacing — ideal for sketching, diagrams, and math."
      onGenerate={generate}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Grid spacing: {spacingMm} mm</Label>
          <Slider
            min={3}
            max={10}
            step={0.5}
            value={[spacingMm]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setSpacingMm(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 mm (fine)</span>
            <span>10 mm (large)</span>
          </div>
        </div>
      )}
    >
      {() => {
        const spacing = Math.max(10, spacingMm * 4);
        return (
          <div className="flex items-center gap-5">
            <div
              className="relative border border-border/30 rounded overflow-hidden"
              style={{ width: 200, height: 200, flexShrink: 0 }}
            >
              <svg width={200} height={200}>
                {Array.from(
                  { length: Math.floor(190 / spacing) + 1 },
                  (_, i) => {
                    const pos = 5 + i * spacing;
                    return (
                      <g key={i}>
                        <line x1={5} y1={pos} x2={195} y2={pos} stroke="#ddd" strokeWidth={0.5} />
                        <line x1={pos} y1={5} x2={pos} y2={195} stroke="#ddd" strokeWidth={0.5} />
                      </g>
                    );
                  }
                )}
              </svg>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{spacingMm} mm grid</div>
              <div>Square cells</div>
            </div>
          </div>
        );
      }}
    </TemplateShell>
  );
}
