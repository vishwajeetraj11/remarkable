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

export default function BookNotesPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Page 1: Book overview
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Book Notes", m.left + 4, m.top + 16);
    doc.setFont("helvetica", "normal");

    const [lr, lg, lb] = COLORS.lineMedium;
    doc.setDrawColor(lr, lg, lb);
    doc.setLineWidth(0.5);
    doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

    let y = m.top + 30;
    drawLabeledLine(doc, "Title:", m.left + 4, y, w - m.right - 4);
    y += 16;
    drawLabeledLine(doc, "Author:", m.left + 4, y, m.left + bodyW * 0.5);
    drawLabeledLine(doc, "Genre:", m.left + bodyW * 0.55, y, w - m.right - 4);
    y += 16;
    drawLabeledLine(doc, "Started:", m.left + 4, y, m.left + bodyW * 0.3);
    drawLabeledLine(doc, "Finished:", m.left + bodyW * 0.35, y, m.left + bodyW * 0.65);
    drawLabeledLine(doc, "Rating:", m.left + bodyW * 0.7, y, w - m.right - 4);

    y += 22;
    drawSectionTitle(doc, "Why I Read This", m.left + 4, y);
    drawHorizontalLines(doc, variants, {
      startY: y + 2,
      endY: y + 36,
      spacing: 16,
    });

    y += 48;
    drawSectionTitle(doc, "Key Takeaways", m.left + 4, y);
    drawHorizontalLines(doc, variants, {
      startY: y + 2,
      endY: y + 60,
      spacing: 16,
    });

    y += 72;
    const halfW = (bodyW - 12) / 2;
    drawBox(doc, m.left, y, halfW, 80, { label: "Favorite Quotes" });
    drawBox(doc, m.left + halfW + 12, y, halfW, 80, { label: "Action Items" });

    y += 92;
    drawSectionTitle(doc, "One-Sentence Summary", m.left + 4, y);
    drawHorizontalLines(doc, variants, {
      startY: y + 2,
      endY: h - m.bottom,
      spacing: 18,
    });

    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    drawPageNumber(doc, 1, pageCount, variants);

    // Extra chapter notes pages
    for (let p = 1; p < pageCount; p++) {
      doc.addPage();
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Chapter Notes", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      drawLabeledLine(doc, "Chapter:", m.left + 4, m.top + 30, w - m.right - 4);

      drawSectionTitle(doc, "Notes", m.left + 4, m.top + 48);
      drawHorizontalLines(doc, variants, {
        startY: m.top + 52,
        endY: h - m.bottom,
        spacing: 16,
      });

      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, p + 1, pageCount, variants);
    }

    doc.save(`book-notes-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Book Notes"
      description="Book overview page with takeaways, quotes, and action items, plus chapter note pages."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Book metadata header</div>
          <div>Key takeaways & one-sentence summary</div>
          <div>Favorite quotes & action items boxes</div>
          <div>Chapter notes continuation pages</div>
        </div>
      )}
    </TemplateShell>
  );
}
