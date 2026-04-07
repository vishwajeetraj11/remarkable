"use client";

import {
  createDoc,
  drawHeader,
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

export default function OneOnOnePage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "1:1 Notes", dark: true });

      let y = m.top + 44;
      drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + 120);
      drawLabeledLine(doc, "With:", m.left + 130, y, w - m.right - 4);

      y += 22;
      const halfW = (bodyW - 12) / 2;

      // Two-column layout
      drawBox(doc, m.left, y, halfW, 100, { label: "Their Updates" });
      drawBox(doc, m.left + halfW + 12, y, halfW, 100, { label: "My Updates" });

      y += 112;
      drawSectionTitle(doc, "Discussion Topics", m.left + 4, y);
      y += 10;
      for (let i = 0; i < 5; i++) {
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 4, y + i * 18 + 8, w - m.right - 4, y + i * 18 + 8);
      }

      y += 100;
      drawSectionTitle(doc, "Feedback / Recognition", m.left + 4, y);
      drawHorizontalLines(doc, variants, {
        startY: y + 2,
        endY: y + 60,
        spacing: 18,
      });

      y += 72;
      drawSectionTitle(doc, "Action Items", m.left + 4, y);
      y += 10;
      const remaining = Math.floor((h - m.bottom - y) / 20);
      for (let i = 0; i < remaining; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 20, 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * 20 + 7, w - m.right - 4, y + i * 20 + 7);
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`one-on-one-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="1:1 Notes"
      description="Two-column layout for 1:1 meetings with updates, discussion topics, and action items."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Their updates / My updates columns</div>
          <div>Discussion topics</div>
          <div>Feedback section</div>
          <div>Action items with checkboxes</div>
        </div>
      )}
    </TemplateShell>
  );
}
