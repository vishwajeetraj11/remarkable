"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
  drawCheckbox,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function BrainDumpPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Brain Dump", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      // Top half: free-form dump area
      let y = m.top + 30;
      drawSectionTitle(doc, "Dump Everything Here", m.left + 4, y);
      const dumpEnd = m.top + (h - m.top - m.bottom) * 0.55;
      drawHorizontalLines(doc, variants, {
        startY: y + 4,
        endY: dumpEnd,
        spacing: 16,
      });

      // Divider
      y = dumpEnd + 6;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.8);
      doc.line(m.left, y, w - m.right, y);

      // Bottom half: sort into next actions
      y += 12;
      const halfW = (bodyW - 16) / 2;

      // Do Now
      drawSectionTitle(doc, "Do Now", m.left + 4, y);
      let ay = y + 10;
      const colEnd = h - m.bottom - 10;
      const actionLines = Math.floor((colEnd - ay) / 20);
      for (let i = 0; i < actionLines; i++) {
        drawCheckbox(doc, m.left + 6, ay + i * 20, 7);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, ay + i * 20 + 7, m.left + halfW, ay + i * 20 + 7);
      }

      // Delegate / Schedule / Drop
      const rightX = m.left + halfW + 16;
      drawSectionTitle(doc, "Schedule / Delegate / Drop", rightX, y);
      ay = y + 10;
      for (let i = 0; i < actionLines; i++) {
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(rightX + 4, ay + i * 20 + 7, w - m.right - 4, ay + i * 20 + 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`brain-dump-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Brain Dump to Next Actions"
      description="Dump everything on your mind in the top section, then sort into actionable categories below."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Free-form dump area (top half)</div>
          <div>Sort into &ldquo;Do Now&rdquo; with checkboxes</div>
          <div>&ldquo;Schedule / Delegate / Drop&rdquo; column</div>
        </div>
      )}
    </TemplateShell>
  );
}
