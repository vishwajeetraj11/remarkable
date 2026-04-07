"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawHorizontalLines,
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

export default function PaperSummaryPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Paper / Article Summary", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      let y = m.top + 30;
      drawLabeledLine(doc, "Title:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Authors:", m.left + 4, y, w - m.right - 4);
      y += 16;
      drawLabeledLine(doc, "Source:", m.left + 4, y, m.left + bodyW * 0.5);
      drawLabeledLine(doc, "Date:", m.left + bodyW * 0.55, y, w - m.right - 4);

      y += 22;
      drawSectionTitle(doc, "Main Thesis / Argument", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 40,
        spacing: 16,
      });

      y += 52;
      drawSectionTitle(doc, "Key Findings / Points", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 70,
        spacing: 16,
      });

      y += 82;
      const halfW = (bodyW - 12) / 2;
      drawBox(doc, m.left, y, halfW, 70, { label: "Methodology" });
      drawBox(doc, m.left + halfW + 12, y, halfW, 70, { label: "Limitations" });

      y += 82;
      drawSectionTitle(doc, "My Takeaways / Applications", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 50,
        spacing: 16,
      });

      y += 62;
      drawSectionTitle(doc, "Related Papers / Further Reading", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: h - m.bottom,
        spacing: 16,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`paper-summary-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Paper / Article Summary"
      description="Academic paper summary with thesis, key findings, methodology, and personal takeaways."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Title, authors, source metadata</div>
          <div>Main thesis & key findings</div>
          <div>Methodology & limitations boxes</div>
          <div>Personal takeaways & further reading</div>
        </div>
      )}
    </TemplateShell>
  );
}
