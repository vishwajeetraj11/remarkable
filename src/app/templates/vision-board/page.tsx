"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawBox,
  drawLabeledLine,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const SECTIONS = [
  "Career & Work",
  "Health & Fitness",
  "Relationships",
  "Personal Growth",
  "Finance",
  "Adventure & Fun",
];

export default function VisionBoardPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Vision Board", dark: true });

      let y = m.top + 44;

      drawLabeledLine(doc, "My Word for the Year:", m.left + 4, y, m.left + bodyW * 0.45);
      drawLabeledLine(doc, "Core Values:", m.left + bodyW * 0.5, y, w - m.right - 4);
      y += 22;

      const cols = 2;
      const rows = 3;
      const gap = 8;
      const boxW = (bodyW - gap * (cols - 1)) / cols;
      const boxH = (h - m.bottom - y - 20 - gap * (rows - 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx >= SECTIONS.length) continue;

          const bx = m.left + c * (boxW + gap);
          const by = y + r * (boxH + gap);

          drawBox(doc, bx, by, boxW, boxH, { label: SECTIONS[idx] });

          const lineStart = by + 18;
          const lineEnd = by + boxH - 4;
          const spacing = 16;
          const [lr, lg, lb] = COLORS.lineLight;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.3);
          let ly = lineStart + spacing;
          while (ly <= lineEnd) {
            doc.line(bx + 4, ly, bx + boxW - 4, ly);
            ly += spacing;
          }
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`vision-board-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Vision Board Template"
      description="Structured goal-setting template with sections for different life areas."
      onGenerate={generate}
      defaultPageCount={1}
      maxPages={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Word of the Year &amp; Core Values header</div>
          <div>2×3 grid: {SECTIONS.join(", ")}</div>
          <div>Lined writing space in each section</div>
        </div>
      )}
    </TemplateShell>
  );
}
