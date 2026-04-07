"use client";

import {
  createDoc,
  drawHeader,
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

export default function InboxCapturePage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, { title: "Inbox / Capture" });

      let y = m.top + 48;
      drawSectionTitle(doc, "Quick Capture", m.left + 4, y);
      y += 10;

      const lineH = 22;
      const maxLines = Math.floor((h - m.bottom - y - 60) / lineH);
      const captureLines = Math.min(maxLines, 20);

      for (let i = 0; i < captureLines; i++) {
        drawCheckbox(doc, m.left + 6, y + i * lineH, 7);
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 18, y + i * lineH + 7, w - m.right - 4, y + i * lineH + 7);
      }

      // Bottom section: process later
      y += captureLines * lineH + 8;
      if (y < h - m.bottom - 40) {
        drawSectionTitle(doc, "To Process / Decide", m.left + 4, y);
        drawHorizontalLines(doc, variants, {
          startY: y + 2,
          endY: h - m.bottom,
          spacing: 18,
        });
      }

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`inbox-capture-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Inbox / Capture Page"
      description="Quick-capture page with checkbox lines for ideas, tasks, and items to process later."
      onGenerate={generate}
      defaultPageCount={5}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Checkbox lines for quick capture</div>
          <div>&ldquo;To Process / Decide&rdquo; section at bottom</div>
          <div>GTD-style inbox for loose thoughts</div>
        </div>
      )}
    </TemplateShell>
  );
}
