"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Toggle } from "@/components/templates/variant-controls";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDoc,
  drawPageNumber,
  MM_TO_PT,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const RULINGS = {
  narrow: { mm: 6, label: "Narrow (6 mm)" },
  college: { mm: 7, label: "College (7 mm)" },
  wide: { mm: 9, label: "Wide (9 mm)" },
};

type RulingKey = keyof typeof RULINGS;

export default function LinedPage() {
  const [ruling, setRuling] = useState<RulingKey>("college");
  const [margin, setMargin] = useState(true);
  const [header, setHeader] = useState(true);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const spacingPt = RULINGS[ruling].mm * MM_TO_PT;
    const leftMargin = margin ? m.left : 28;
    const rightEdge = w - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      const headerLineY = header ? m.top + spacingPt * 2 : m.top;

      if (header) {
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.8);
        doc.line(leftMargin, headerLineY, rightEdge, headerLineY);
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.4);
        doc.line(leftMargin, m.top + 4, rightEdge, m.top + 4);
      }

      if (margin) {
        const [r, g, b] = COLORS.marginRed;
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, m.top, leftMargin, h - m.bottom);
      }

      const [r, g, b] = COLORS.lineMedium;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      let y = headerLineY + spacingPt;
      while (y <= h - m.bottom) {
        doc.line(leftMargin, y, rightEdge, y);
        y += spacingPt;
      }

      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`lined-${ruling}-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Lined Paper"
      description="Classic horizontal ruling with adjustable spacing, optional left margin, and header zone."
      onGenerate={generate}
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Line spacing (ruling)</Label>
            <Select
              value={ruling}
              onValueChange={(v) => setRuling(v as RulingKey)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RULINGS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-1">
            <Toggle
              checked={margin}
              onToggle={() => setMargin((v) => !v)}
              label="Left margin line"
            />
            <Toggle
              checked={header}
              onToggle={() => setHeader((v) => !v)}
              label="Header space"
            />
          </div>
        </div>
      )}
    >
      {(variants) => {
        const spacingPx = RULINGS[ruling].mm * 3.2;
        const previewLines = 8;
        const { h: ph } = getPageDimensions(variants);
        const sp = RULINGS[ruling].mm * MM_TO_PT;
        const linesPerPage = Math.floor(
          (ph - 56 - (header ? sp * 2 : 0)) / sp
        );
        return (
          <div className="flex gap-6">
            <div
              className="relative border border-border/40 rounded"
              style={{ width: 200, height: 240, flexShrink: 0 }}
            >
              {header && (
                <>
                  <div
                    className="absolute left-0 right-0 border-t border-gray-400"
                    style={{ top: 28 }}
                  />
                  <div
                    className="absolute left-0 right-0 border-t-2 border-gray-500"
                    style={{ top: 52 }}
                  />
                </>
              )}
              {margin && (
                <div
                  className="absolute top-0 bottom-0 border-l border-red-300"
                  style={{
                    left: variants.handedness === "left" ? undefined : 36,
                    right: variants.handedness === "left" ? 36 : undefined,
                  }}
                />
              )}
              {Array.from({ length: previewLines }, (_, i) => {
                const top = (header ? 52 : 12) + (i + 1) * spacingPx;
                return (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-gray-200"
                    style={{ top }}
                  />
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground space-y-1.5">
              <div>
                <span className="font-medium">~{linesPerPage}</span> lines per
                page
              </div>
              <div>{RULINGS[ruling].mm} mm ruling</div>
              {margin && <div>Left margin</div>}
              {header && <div>Header space</div>}
            </div>
          </div>
        );
      }}
    </TemplateShell>
  );
}
