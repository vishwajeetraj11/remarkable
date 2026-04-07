"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
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

export default function GratitudeJournalPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Gratitude Journal", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.6, m.top + 16, w - m.right - 4);

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      let y = m.top + 34;

      // Morning gratitude (3 items with numbering)
      drawSectionTitle(doc, "I Am Grateful For (Morning)", m.left + 4, y);
      y += 12;
      for (let i = 0; i < 3; i++) {
        doc.setFontSize(9);
        const [tr, tg, tb] = COLORS.textMedium;
        doc.setTextColor(tr, tg, tb);
        doc.text(`${i + 1}.`, m.left + 6, y + i * 28 + 10);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 16, y + i * 28 + 12, w - m.right - 4, y + i * 28 + 12);
        doc.line(m.left + 16, y + i * 28 + 26, w - m.right - 4, y + i * 28 + 26);
      }

      y += 92;
      drawSectionTitle(doc, "What Would Make Today Great", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 54,
        spacing: 18,
      });

      y += 66;
      doc.setDrawColor(lr, lg, lb);
      doc.line(m.left, y, w - m.right, y);
      y += 10;

      // Evening reflection
      drawSectionTitle(doc, "Evening — Amazing Things That Happened", m.left + 4, y);
      y += 12;
      for (let i = 0; i < 3; i++) {
        doc.setFontSize(9);
        const [tr, tg, tb] = COLORS.textMedium;
        doc.setTextColor(tr, tg, tb);
        doc.text(`${i + 1}.`, m.left + 6, y + i * 28 + 10);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 16, y + i * 28 + 12, w - m.right - 4, y + i * 28 + 12);
        doc.line(m.left + 16, y + i * 28 + 26, w - m.right - 4, y + i * 28 + 26);
      }

      y += 92;
      drawSectionTitle(doc, "What I Could Have Done Better", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: h - m.bottom,
        spacing: 18,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`gratitude-journal-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Gratitude Journal"
      description="Morning & evening gratitude prompts with space for 3 items each and daily reflections."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>3 morning gratitudes</div>
          <div>&ldquo;What would make today great&rdquo;</div>
          <div>3 evening highlights</div>
          <div>Improvement reflection</div>
        </div>
      )}
    </TemplateShell>
  );
}
