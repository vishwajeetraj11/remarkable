"use client";

import {
  createDoc,
  drawHeader,
  drawPageNumber,
  drawBox,
  drawCheckbox,
  drawLabeledLine,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const AREAS = [
  "Career",
  "Money",
  "Health",
  "Relationships",
  "Personal Growth",
  "Fun & Adventure",
];

export default function GoalBoardPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Goal Board",
        subtitle: "Quarterly goals & milestones",
        dark: true,
      });

      let y = m.top + 44;

      // Quarter + theme row
      drawLabeledLine(doc, "Quarter:", m.left + 4, y, m.left + bodyW * 0.3);
      drawLabeledLine(doc, "Theme:", m.left + bodyW * 0.38, y, w - m.right - 4);
      y += 24;

      const cols = 2;
      const rows = 3;
      const gap = 8;
      const boxW = (bodyW - gap * (cols - 1)) / cols;
      const boxH = (h - m.bottom - y - 20 - gap * (rows - 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx >= AREAS.length) continue;

          const bx = m.left + c * (boxW + gap);
          const by = y + r * (boxH + gap);

          drawBox(doc, bx, by, boxW, boxH, { label: AREAS[idx] });

          // Goal line
          let ly = by + 22;
          doc.setFontSize(6);
          const [tr, tg, tb] = COLORS.textLight;
          doc.setTextColor(tr, tg, tb);
          doc.text("Goal", bx + 4, ly);
          const [lr, lg, lb] = COLORS.lineLight;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.4);
          doc.line(bx + 22, ly + 1, bx + boxW - 4, ly + 1);

          // Milestones with checkboxes
          ly += 16;
          for (let i = 0; i < 3 && ly < by + boxH - 18; i++) {
            drawCheckbox(doc, bx + 4, ly - 5, 6);
            doc.line(bx + 14, ly + 1, bx + boxW - 4, ly + 1);
            ly += 14;
          }

          // Target date line pinned near the bottom of the box
          doc.setFontSize(6);
          doc.setTextColor(tr, tg, tb);
          doc.text("Target", bx + 4, by + boxH - 8);
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.4);
          doc.line(bx + 22, by + boxH - 7, bx + boxW - 4, by + boxH - 7);
        }
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`goal-board-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Goal Board Template"
      description="Quarterly goal-setting board — one goal per life area with milestones and target dates."
      onGenerate={generate}
      defaultPageCount={1}
      maxPages={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Quarter &amp; theme header lines</div>
          <div>2×3 grid: {AREAS.join(", ")}</div>
          <div>Each area: goal line, 3 milestone checkboxes, target date</div>
        </div>
      )}
    </TemplateShell>
  );
}
