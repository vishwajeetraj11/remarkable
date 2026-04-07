"use client";

import {
  createDoc,
  drawPageNumber,
  drawSectionTitle,
  drawCheckbox,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import { TemplateShell } from "@/components/templates/template-shell";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const DEFAULT_ITEMS = [
  "Review today's tasks — mark done or move",
  "Process inbox to zero",
  "Check calendar for tomorrow",
  "Identify top 3 priorities for tomorrow",
  "Clear desk / workspace",
  "Close all tabs and apps",
  "Write one thing I accomplished today",
  "Set tomorrow's intention",
];

export default function ShutdownChecklistPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Shutdown Checklist", m.left + 4, m.top + 16);
      doc.setFont("helvetica", "normal");

      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, m.top + 22, w - m.right, m.top + 22);

      let y = m.top + 34;
      drawSectionTitle(doc, "End-of-Day Routine", m.left + 4, y);
      y += 14;

      // Pre-printed checklist items
      DEFAULT_ITEMS.forEach((item, i) => {
        drawCheckbox(doc, m.left + 6, y + i * 24, 8);
        doc.setFontSize(8);
        const [tr, tg, tb] = COLORS.textDark;
        doc.setTextColor(tr, tg, tb);
        doc.text(item, m.left + 20, y + i * 24 + 7);
      });

      // Extra blank checkbox lines
      y += DEFAULT_ITEMS.length * 24 + 8;
      drawSectionTitle(doc, "Custom Items", m.left + 4, y);
      y += 12;
      const remaining = Math.floor((h - m.bottom - 80 - y) / 24);
      for (let i = 0; i < remaining; i++) {
        drawCheckbox(doc, m.left + 6, y + i * 24, 8);
        const [llr, llg, llb] = COLORS.lineLight;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left + 20, y + i * 24 + 8, w - m.right - 4, y + i * 24 + 8);
      }

      // Tomorrow's intention
      const intentY = h - m.bottom - 60;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      doc.line(m.left, intentY - 6, w - m.right, intentY - 6);
      drawSectionTitle(doc, "Tomorrow's Focus", m.left + 4, intentY + 6);
      drawHorizontalLines(doc, variants, {
        startY: intentY + 10,
        endY: h - m.bottom,
        spacing: 18,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`shutdown-checklist-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Shutdown Checklist"
      description="End-of-day routine checklist with pre-printed items, custom slots, and tomorrow's focus."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>8 pre-printed routine items</div>
          <div>Custom blank checkbox lines</div>
          <div>&ldquo;Tomorrow&apos;s Focus&rdquo; section</div>
        </div>
      )}
    </TemplateShell>
  );
}
