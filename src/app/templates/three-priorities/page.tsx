"use client";

import {
  createDoc,
  drawPageNumber,
  drawCheckbox,
  drawHorizontalLines,
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

export default function ThreePrioritiesPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("3 Priorities", m.left + 4, m.top + 18);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.55, m.top + 18, w - m.right - 4);

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 24, w - m.right, m.top + 24);

      // Three large priority blocks
      const blockTop = m.top + 34;
      const blockH = (h - m.bottom - blockTop - 60) / 3;

      for (let i = 0; i < 3; i++) {
        const by = blockTop + i * (blockH + 8);

        // Priority number circle
        const circleR = 10;
        const cx = m.left + circleR + 4;
        const cy = by + circleR + 2;
        const [fr, fg, fb] = COLORS.textMedium;
        doc.setFillColor(fr, fg, fb);
        doc.circle(cx, cy, circleR, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const [wr, wg, wb] = COLORS.white;
        doc.setTextColor(wr, wg, wb);
        doc.text(String(i + 1), cx, cy + 4, { align: "center" });

        // Priority title line
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.5);
        doc.line(cx + circleR + 8, by + 14, w - m.right - 4, by + 14);

        // Sub-tasks
        const subTop = by + 28;
        const subCount = Math.floor((blockH - 30) / 20);
        for (let s = 0; s < subCount; s++) {
          drawCheckbox(doc, m.left + 30, subTop + s * 20, 7);
          doc.setDrawColor(llr, llg, llb);
          doc.setLineWidth(0.2);
          doc.line(m.left + 42, subTop + s * 20 + 7, w - m.right - 4, subTop + s * 20 + 7);
        }

        doc.setFont("helvetica", "normal");
      }

      // Daily win / reflection at bottom
      const winY = h - m.bottom - 40;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, winY - 6, w - m.right, winY - 6);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text("Today's win:", m.left + 4, winY + 6);
      doc.setFont("helvetica", "normal");
      const [llr2, llg2, llb2] = COLORS.lineLight;
      doc.setDrawColor(llr2, llg2, llb2);
      doc.setLineWidth(0.3);
      doc.line(m.left + 56, winY + 8, w - m.right - 4, winY + 8);

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`three-priorities-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="3 Priorities"
      description="Focus on just three things. Large numbered blocks with sub-task checkboxes and a daily win section."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>3 large priority blocks with numbers</div>
          <div>Sub-task checkboxes per priority</div>
          <div>&ldquo;Today&apos;s win&rdquo; reflection at bottom</div>
        </div>
      )}
    </TemplateShell>
  );
}
