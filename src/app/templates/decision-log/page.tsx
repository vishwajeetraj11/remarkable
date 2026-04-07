"use client";

import {
  createDoc,
  drawHeader,
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

export default function DecisionLogPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Decision Log", dark: true });

      // Two decision entries per page
      const entryH = (h - m.top - m.bottom - 48) / 2;

      for (let entry = 0; entry < 2; entry++) {
        let y = m.top + 44 + entry * (entryH + 8);
        const entryBottom = y + entryH;

        if (entry > 0) {
          const [lr, lg, lb] = COLORS.lineMedium;
          doc.setDrawColor(lr, lg, lb);
          doc.setLineWidth(0.5);
          doc.line(m.left, y - 4, w - m.right, y - 4);
        }

        drawLabeledLine(doc, "Decision:", m.left + 4, y, w - m.right - 4);
        y += 16;
        drawLabeledLine(doc, "Date:", m.left + 4, y, m.left + bodyW * 0.4);
        drawLabeledLine(doc, "Decided by:", m.left + bodyW * 0.45, y, w - m.right - 4);

        y += 20;
        drawSectionTitle(doc, "Context / Problem", m.left + 4, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 2,
          endY: y + 40,
          spacing: 16,
        });

        y += 50;
        drawSectionTitle(doc, "Options Considered", m.left + 4, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 2,
          endY: y + 36,
          spacing: 16,
        });

        y += 46;
        drawSectionTitle(doc, "Outcome / Rationale", m.left + 4, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 2,
          endY: entryBottom,
          spacing: 16,
        });
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`decision-log-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Decision Log"
      description="Record decisions with context, options considered, and rationale. Two entries per page."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>2 decision entries per page</div>
          <div>Context / problem statement</div>
          <div>Options considered</div>
          <div>Outcome & rationale</div>
        </div>
      )}
    </TemplateShell>
  );
}
