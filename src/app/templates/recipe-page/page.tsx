"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
  drawCheckbox,
  drawLabeledLine,
  drawBox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function RecipePage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Recipe", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      let y = m.top + 30;
      drawLabeledLine(doc, "Recipe:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Source:", m.left + 4, y, m.left + bodyW * 0.5);
      drawLabeledLine(doc, "Serves:", m.left + bodyW * 0.55, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Prep:", m.left + 4, y, m.left + bodyW * 0.3);
      drawLabeledLine(doc, "Cook:", m.left + bodyW * 0.35, y, m.left + bodyW * 0.65);
      drawLabeledLine(doc, "Total:", m.left + bodyW * 0.7, y, w - m.right - 4);

      y += 20;
      const ingW = bodyW * 0.35;
      const stepsW = bodyW - ingW - 12;
      const colH = h - m.bottom - y - 60;

      // Ingredients column
      drawBox(doc, m.left, y, ingW, colH, { label: "Ingredients" });
      const ingStartY = y + 16;
      const ingItems = Math.floor((colH - 20) / 16);
      for (let i = 0; i < ingItems; i++) {
        drawCheckbox(doc, m.left + 6, ingStartY + i * 16, 6);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.2);
        doc.line(
          m.left + 16,
          ingStartY + i * 16 + 6,
          m.left + ingW - 6,
          ingStartY + i * 16 + 6
        );
      }

      // Steps column
      const stepsX = m.left + ingW + 12;
      drawBox(doc, stepsX, y, stepsW, colH, { label: "Instructions" });
      const stepsItems = 10;
      const stepsStartY = y + 16;
      const stepH = (colH - 20) / stepsItems;
      for (let i = 0; i < stepsItems; i++) {
        const sy = stepsStartY + i * stepH;
        doc.setFontSize(7);
        const [tr, tg, tb] = COLORS.textLight;
        doc.setTextColor(tr, tg, tb);
        doc.text(`${i + 1}.`, stepsX + 6, sy + 8);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.2);
        doc.line(stepsX + 16, sy + 10, stepsX + stepsW - 6, sy + 10);
      }

      // Notes at bottom
      const notesY = y + colH + 8;
      if (notesY < h - m.bottom - 20) {
        drawSectionTitle(doc, "Notes", m.left + 4, notesY);
        drawHorizontalLines(doc, variants, {
          startY: notesY + 4,
          endY: h - m.bottom,
          spacing: 16,
        });
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`recipe-page-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Recipe Page"
      description="Recipe card with ingredients checklist, numbered instructions, and notes."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Recipe name, source, servings, times</div>
          <div>Ingredients checklist column</div>
          <div>Numbered instructions column</div>
          <div>Notes section at bottom</div>
        </div>
      )}
    </TemplateShell>
  );
}
